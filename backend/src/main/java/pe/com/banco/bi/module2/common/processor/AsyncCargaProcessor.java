package pe.com.banco.bi.module2.common.processor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.repository.EstadoCargaRepository;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;
import pe.com.banco.bi.module2.archivocarga.repository.ArchivoCargaRepository;
import pe.com.banco.bi.module2.common.storage.StorageService;
import pe.com.banco.bi.module2.detallecarga.entity.DetalleCarga;
import pe.com.banco.bi.module2.detallecarga.repository.DetalleCargaRepository;
import pe.com.banco.bi.module2.errorcarga.entity.ErrorCarga;
import pe.com.banco.bi.module2.errorcarga.repository.ErrorCargaRepository;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;
import pe.com.banco.bi.module2.resultadocarga.repository.ResultadoCargaRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AsyncCargaProcessor {

    private final ProcesoCargaRepository procesoCargaRepository;
    private final ArchivoCargaRepository archivoCargaRepository;
    private final DetalleCargaRepository detalleCargaRepository;
    private final ErrorCargaRepository errorCargaRepository;
    private final ResultadoCargaRepository resultadoCargaRepository;
    private final EstadoCargaRepository estadoCargaRepository;
    private final StorageService storageService;

    @Async
    @Transactional
    public void procesarCarga(Long procesoCargaId) {
        log.info("Iniciando procesamiento asíncrono de carga {}", procesoCargaId);

        ProcesoCarga proceso = procesoCargaRepository.findById(procesoCargaId)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado: " + procesoCargaId));

        ArchivoCarga archivo = archivoCargaRepository.findByProcesoCargaId(procesoCargaId)
                .orElseThrow(() -> new RuntimeException("Archivo no encontrado para carga: " + procesoCargaId));

        EstadoCarga enValidacion = estadoCargaRepository.findByCodigo("EN_VALIDACION")
                .orElseThrow(() -> new RuntimeException("Estado EN_VALIDACION no encontrado"));

        proceso.setEstadoCarga(enValidacion);
        proceso.setFechaInicio(LocalDateTime.now());
        procesoCargaRepository.save(proceso);

        try {
            List<DetalleCarga> detalles = new ArrayList<>();
            List<ErrorCarga> errores = new ArrayList<>();

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(storageService.loadAsInputStream(archivo.getRutaArchivo())))) {

                String linea;
                int numeroFila = 0;
                while ((linea = reader.readLine()) != null) {
                    numeroFila++;
                    if (linea.isBlank()) continue;

                    List<String> erroresFila = validarFila(linea, numeroFila);
                    boolean esValido = erroresFila.isEmpty();

                    detalles.add(DetalleCarga.builder()
                            .numeroFila(numeroFila)
                            .datosFila(linea)
                            .esValido(esValido)
                            .observaciones(esValido ? null : String.join("; ", erroresFila))
                            .procesoCarga(proceso)
                            .build());

                    for (String mensaje : erroresFila) {
                        errores.add(ErrorCarga.builder()
                                .numeroFila(numeroFila)
                                .campo("GENERAL")
                                .mensajeError(mensaje)
                                .tipoError("VALIDACION")
                                .procesoCarga(proceso)
                                .build());
                    }
                }
            }

            detalleCargaRepository.saveAll(detalles);
            errorCargaRepository.saveAll(errores);

            int totalRegistros = detalles.size();
            int totalValidos = (int) detalles.stream().filter(DetalleCarga::getEsValido).count();
            int totalInvalidos = totalRegistros - totalValidos;

            String estadoFinal = totalInvalidos > 0 ? "CON_ERRORES" : "VALIDADA";
            EstadoCarga estadoCarga = estadoCargaRepository.findByCodigo(estadoFinal)
                    .orElseThrow(() -> new RuntimeException("Estado " + estadoFinal + " no encontrado"));

            proceso.setEstadoCarga(estadoCarga);
            proceso.setTotalRegistros(totalRegistros);
            proceso.setTotalRegValidos(totalValidos);
            proceso.setTotalRegInvalidos(totalInvalidos);
            proceso.setFechaFin(LocalDateTime.now());
            procesoCargaRepository.save(proceso);

            resultadoCargaRepository.save(ResultadoCarga.builder()
                    .totalRegistros(totalRegistros)
                    .totalRegistrosValidos(totalValidos)
                    .totalRegistrosInvalidos(totalInvalidos)
                    .totalRegistrosProcesados(0)
                    .procesoCarga(proceso)
                    .build());

            log.info("Carga {} procesada: {} registros, {} válidos, {} inválidos", procesoCargaId, totalRegistros, totalValidos, totalInvalidos);

        } catch (Exception e) {
            log.error("Error procesando carga {}", procesoCargaId, e);
            EstadoCarga rechazada = estadoCargaRepository.findByCodigo("RECHAZADA")
                    .orElseThrow(() -> new RuntimeException("Estado RECHAZADA no encontrado"));
            proceso.setEstadoCarga(rechazada);
            proceso.setObservacion("Error en procesamiento: " + e.getMessage());
            proceso.setFechaFin(LocalDateTime.now());
            procesoCargaRepository.save(proceso);
        }
    }

    private List<String> validarFila(String linea, int numeroFila) {
        List<String> errores = new ArrayList<>();
        String[] columnas = linea.split(",");

        if (columnas.length < 2) {
            errores.add("Fila " + numeroFila + ": número de columnas insuficiente");
        }

        for (int i = 0; i < columnas.length; i++) {
            if (columnas[i] == null || columnas[i].isBlank()) {
                errores.add("Fila " + numeroFila + ": columna " + (i + 1) + " está vacía");
            }
        }

        return errores;
    }
}

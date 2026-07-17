package pe.com.banco.bi.module2.common.processor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.repository.*;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
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
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AsyncCargaProcessor {

    private static final Map<String, String[]> CAMPOS_POR_TIPO = Map.of(
            "CAMPANIAS", new String[]{"codigo", "nombre", "descripcion", "fechaInicio", "fechaFin", "estado", "periodoCodigo", "productoCodigo", "subproductoCodigo"},
            "CLIENTES", new String[]{"tipoDocumentoCodigo", "numeroDocumento", "primerNombre", "segundoNombre", "apellidoPaterno", "apellidoMaterno", "correo", "telefono", "segmentoCodigo", "zonaCodigo", "agenciaCodigo", "canalCodigo", "tipoClienteCodigo"},
            "OFERTAS", new String[]{"campaniaCodigo", "clienteNumeroDocumento", "monto", "tasa", "fechaOferta", "estado"}
    );

    private final ProcesoCargaRepository procesoCargaRepository;
    private final ArchivoCargaRepository archivoCargaRepository;
    private final DetalleCargaRepository detalleCargaRepository;
    private final ErrorCargaRepository errorCargaRepository;
    private final ResultadoCargaRepository resultadoCargaRepository;
    private final EstadoCargaRepository estadoCargaRepository;
    private final StorageService storageService;

    private final PeriodoRepository periodoRepository;
    private final ProductoRepository productoRepository;
    private final SubproductoRepository subproductoRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final SegmentoRepository segmentoRepository;
    private final ZonaRepository zonaRepository;
    private final AgenciaRepository agenciaRepository;
    private final CanalRepository canalRepository;
    private final TipoClienteRepository tipoClienteRepository;
    private final CampaniaRepository campaniaRepository;
    private final ClienteRepository clienteRepository;

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
            String tipoCargaCodigo = proceso.getTipoCarga().getCodigo();
            String[] campos = CAMPOS_POR_TIPO.getOrDefault(tipoCargaCodigo.toUpperCase(), new String[0]);

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(storageService.loadAsInputStream(archivo.getRutaArchivo())))) {

                String linea;
                int numeroFila = 0;
                boolean primeraLinea = true;
                while ((linea = reader.readLine()) != null) {
                    numeroFila++;
                    if (linea.isBlank()) continue;
                    if (primeraLinea) {
                        primeraLinea = false;
                        continue;
                    }

                    List<ErrorCarga> erroresFila = validarFila(linea, numeroFila, tipoCargaCodigo, campos, proceso);
                    boolean esValido = erroresFila.isEmpty();

                    detalles.add(DetalleCarga.builder()
                            .numeroFila(numeroFila)
                            .datosFila(linea)
                            .esValido(esValido)
                            .observaciones(esValido ? null : erroresFila.stream()
                                    .map(ErrorCarga::getMensajeError)
                                    .reduce((a, b) -> a + "; " + b)
                                    .orElse(null))
                            .procesoCarga(proceso)
                            .build());

                    errores.addAll(erroresFila);
                }
            }

            detalleCargaRepository.saveAll(detalles);
            errorCargaRepository.saveAll(errores);

            int totalRegistros = detalles.size();
            int totalValidos = (int) detalles.stream().filter(DetalleCarga::getEsValido).count();
            int totalInvalidos = totalRegistros - totalValidos;

            String estadoFinal = totalValidos > 0 ? "VALIDADA" : "CON_ERRORES";
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

    private List<ErrorCarga> validarFila(String linea, int numeroFila, String tipoCargaCodigo, String[] campos, ProcesoCarga proceso) {
        List<ErrorCarga> errores = new ArrayList<>();
        String[] columnas = linea.split(",");

        if (columnas.length < 2) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo(campos.length >= 2 ? campos[0] + "," + campos[1] : "GENERAL")
                    .mensajeError("Fila " + numeroFila + ": número de columnas insuficiente")
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
            return errores;
        }

        switch (tipoCargaCodigo.toUpperCase()) {
            case "CAMPANIAS" -> validarCampania(columnas, numeroFila, campos, errores, proceso);
            case "CLIENTES" -> validarCliente(columnas, numeroFila, campos, errores, proceso);
            case "OFERTAS" -> validarOferta(columnas, numeroFila, campos, errores, proceso);
        }

        return errores;
    }

    private void validarCampania(String[] columnas, int numeroFila, String[] campos, List<ErrorCarga> errores, ProcesoCarga proceso) {
        String codigo = getColumna(columnas, 0);
        String nombre = getColumna(columnas, 1);
        String descripcion = getColumna(columnas, 2);
        String fechaInicioStr = getColumna(columnas, 3);
        String fechaFinStr = getColumna(columnas, 4);
        String estado = getColumna(columnas, 5);
        String periodoCodigo = getColumna(columnas, 6);
        String productoCodigo = getColumna(columnas, 7);
        String subproductoCodigo = getColumna(columnas, 8);

        String[] requiredFields = {codigo, nombre, descripcion, fechaInicioStr, fechaFinStr, estado, periodoCodigo, productoCodigo, subproductoCodigo};
        String[] requiredNames = {"codigo", "nombre", "descripcion", "fechaInicio", "fechaFin", "estado", "periodoCodigo", "productoCodigo", "subproductoCodigo"};
        boolean allPresent = true;
        for (int i = 0; i < requiredFields.length; i++) {
            if (requiredFields[i].isBlank() || "N/A".equalsIgnoreCase(requiredFields[i])) {
                errores.add(ErrorCarga.builder()
                        .numeroFila(numeroFila)
                        .campo(requiredNames[i])
                        .mensajeError("Fila " + numeroFila + ": " + requiredNames[i] + " es obligatorio")
                        .tipoError("VALIDACION")
                        .procesoCarga(proceso)
                        .build());
                allPresent = false;
            }
        }

        if (!allPresent) return;

        if (periodoRepository.findByCodigo(periodoCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("periodoCodigo")
                    .mensajeError("Fila " + numeroFila + ": período no encontrado: " + periodoCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (productoRepository.findByCodigo(productoCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("productoCodigo")
                    .mensajeError("Fila " + numeroFila + ": producto no encontrado: " + productoCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (!"N/A".equalsIgnoreCase(subproductoCodigo) && subproductoRepository.findByCodigo(subproductoCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("subproductoCodigo")
                    .mensajeError("Fila " + numeroFila + ": subproducto no encontrado: " + subproductoCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        validarFecha(fechaInicioStr, numeroFila, "fechaInicio", errores, proceso);
        validarFecha(fechaFinStr, numeroFila, "fechaFin", errores, proceso);
    }

    private void validarCliente(String[] columnas, int numeroFila, String[] campos, List<ErrorCarga> errores, ProcesoCarga proceso) {
        String[] requiredFields = new String[13];
        String[] requiredNames = {"tipoDocumentoCodigo", "numeroDocumento", "primerNombre", "segundoNombre", "apellidoPaterno", "apellidoMaterno", "correo", "telefono", "segmentoCodigo", "zonaCodigo", "agenciaCodigo", "canalCodigo", "tipoClienteCodigo"};
        for (int i = 0; i < 13; i++) {
            requiredFields[i] = getColumna(columnas, i);
        }

        boolean allPresent = true;
        for (int i = 0; i < 13; i++) {
            if (i == 3) continue;
            if (requiredFields[i].isBlank()) {
                errores.add(ErrorCarga.builder()
                        .numeroFila(numeroFila)
                        .campo(requiredNames[i])
                        .mensajeError("Fila " + numeroFila + ": " + requiredNames[i] + " es obligatorio")
                        .tipoError("VALIDACION")
                        .procesoCarga(proceso)
                        .build());
                allPresent = false;
            }
        }

        if (!allPresent) return;

        String tipoDocumentoCodigo = requiredFields[0];
        String numeroDocumento = requiredFields[1];
        String segmentoCodigo = requiredFields[8];
        String zonaCodigo = requiredFields[9];
        String agenciaCodigo = requiredFields[10];
        String canalCodigo = requiredFields[11];
        String tipoClienteCodigo = requiredFields[12];

        if (tipoDocumentoRepository.findByCodigo(tipoDocumentoCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("tipoDocumentoCodigo")
                    .mensajeError("Fila " + numeroFila + ": tipo de documento no encontrado: " + tipoDocumentoCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (segmentoRepository.findByCodigo(segmentoCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("segmentoCodigo")
                    .mensajeError("Fila " + numeroFila + ": segmento no encontrado: " + segmentoCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (zonaRepository.findByCodigo(zonaCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("zonaCodigo")
                    .mensajeError("Fila " + numeroFila + ": zona no encontrada: " + zonaCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (agenciaRepository.findByCodigo(agenciaCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("agenciaCodigo")
                    .mensajeError("Fila " + numeroFila + ": agencia no encontrada: " + agenciaCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (canalRepository.findByCodigo(canalCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("canalCodigo")
                    .mensajeError("Fila " + numeroFila + ": canal no encontrado: " + canalCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (tipoClienteRepository.findByCodigo(tipoClienteCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("tipoClienteCodigo")
                    .mensajeError("Fila " + numeroFila + ": tipo de cliente no encontrado: " + tipoClienteCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }
    }

    private void validarOferta(String[] columnas, int numeroFila, String[] campos, List<ErrorCarga> errores, ProcesoCarga proceso) {
        String[] requiredFields = new String[6];
        String[] requiredNames = {"campaniaCodigo", "clienteNumeroDocumento", "monto", "tasa", "fechaOferta", "estado"};
        for (int i = 0; i < 6; i++) {
            requiredFields[i] = getColumna(columnas, i);
        }

        boolean allPresent = true;
        for (int i = 0; i < 6; i++) {
            if (requiredFields[i].isBlank()) {
                errores.add(ErrorCarga.builder()
                        .numeroFila(numeroFila)
                        .campo(requiredNames[i])
                        .mensajeError("Fila " + numeroFila + ": " + requiredNames[i] + " es obligatorio")
                        .tipoError("VALIDACION")
                        .procesoCarga(proceso)
                        .build());
                allPresent = false;
            }
        }

        if (!allPresent) return;

        String campaniaCodigo = requiredFields[0];
        String clienteNumeroDocumento = requiredFields[1];
        String montoStr = requiredFields[2];
        String tasaStr = requiredFields[3];
        String fechaOfertaStr = requiredFields[4];

        if (campaniaRepository.findByCodigo(campaniaCodigo).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("campaniaCodigo")
                    .mensajeError("Fila " + numeroFila + ": campaña no encontrada: " + campaniaCodigo)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        if (clienteRepository.findByNumeroDocumento(clienteNumeroDocumento).isEmpty()) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("clienteNumeroDocumento")
                    .mensajeError("Fila " + numeroFila + ": cliente no encontrado: " + clienteNumeroDocumento)
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        try {
            BigDecimal monto = new BigDecimal(montoStr);
            if (monto.compareTo(BigDecimal.ZERO) <= 0) {
                throw new NumberFormatException();
            }
        } catch (NumberFormatException e) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("monto")
                    .mensajeError("Fila " + numeroFila + ": monto debe ser un número positivo")
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        try {
            new BigDecimal(tasaStr);
        } catch (NumberFormatException e) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo("tasa")
                    .mensajeError("Fila " + numeroFila + ": tasa debe ser un número válido")
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }

        validarFecha(fechaOfertaStr, numeroFila, "fechaOferta", errores, proceso);
    }

    private void validarFecha(String valor, int numeroFila, String campo, List<ErrorCarga> errores, ProcesoCarga proceso) {
        if (valor.isBlank()) return;
        try {
            LocalDate.parse(valor);
        } catch (Exception e) {
            errores.add(ErrorCarga.builder()
                    .numeroFila(numeroFila)
                    .campo(campo)
                    .mensajeError("Fila " + numeroFila + ": formato de fecha inválido (YYYY-MM-DD)")
                    .tipoError("VALIDACION")
                    .procesoCarga(proceso)
                    .build());
        }
    }

    private String getColumna(String[] columnas, int indice) {
        if (indice < 0 || indice >= columnas.length) return "";
        String valor = columnas[indice];
        return valor == null ? "" : valor.trim();
    }
}

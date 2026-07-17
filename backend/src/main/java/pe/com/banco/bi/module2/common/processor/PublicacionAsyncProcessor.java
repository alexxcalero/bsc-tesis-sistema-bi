package pe.com.banco.bi.module2.common.processor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.repository.EstadoCargaRepository;
import pe.com.banco.bi.module2.errorcarga.entity.ErrorCarga;
import pe.com.banco.bi.module2.errorcarga.repository.ErrorCargaRepository;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;
import pe.com.banco.bi.module2.resultadocarga.repository.ResultadoCargaRepository;
import pe.com.banco.bi.module2.common.importer.CargaDataImporter;
import pe.com.banco.bi.module2.common.importer.CargaImporterFactory;
import pe.com.banco.bi.module2.common.importer.ImportError;
import pe.com.banco.bi.module2.common.importer.ImportResult;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module2.detallecarga.repository.DetalleCargaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class PublicacionAsyncProcessor {

    private final ProcesoCargaRepository procesoCargaRepository;
    private final DetalleCargaRepository detalleCargaRepository;
    private final ErrorCargaRepository errorCargaRepository;
    private final ResultadoCargaRepository resultadoCargaRepository;
    private final EstadoCargaRepository estadoCargaRepository;
    private final CargaImporterFactory importerFactory;
    private final CampaniaService campaniaService;

    @Transactional
    public void procesarPublicacion(Long procesoCargaId) {
        ProcesoCarga proceso = procesoCargaRepository.findById(procesoCargaId)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado"));

        String tipoCargaCodigo = proceso.getTipoCarga().getCodigo();
        CargaDataImporter importer = importerFactory.resolver(tipoCargaCodigo);

        List<String[]> filasValidas = detalleCargaRepository.findByProcesoCargaId(procesoCargaId).stream()
                .filter(d -> Boolean.TRUE.equals(d.getEsValido()))
                .map(d -> d.getDatosFila().split(","))
                .collect(Collectors.toList());

        ImportResult resultadoImportacion = importer.importar(procesoCargaId, filasValidas);

        ResultadoCarga resultado = resultadoCargaRepository.findByProcesoCargaId(procesoCargaId)
                .orElseThrow(() -> new RuntimeException("Resultado no encontrado"));

        errorCargaRepository.deleteByProcesoCargaIdAndTipoError(procesoCargaId, "IMPORTACION");

        for (ImportError error : resultadoImportacion.getErrores()) {
            errorCargaRepository.save(ErrorCarga.builder()
                    .numeroFila(error.getNumeroFila())
                    .campo(error.getCampo())
                    .mensajeError(error.getMensajeError())
                    .tipoError(error.getTipoError())
                    .procesoCarga(proceso)
                    .build());
        }

        if (resultadoImportacion.getFilasProcesadas() > 0) {
            EstadoCarga estadoPublicada = estadoCargaRepository.findByCodigo("PUBLICADA")
                    .orElseThrow(() -> new RuntimeException("Estado PUBLICADA no encontrado"));
            proceso.setEstadoCarga(estadoPublicada);
            resultado.setTotalRegistrosProcesados(resultadoImportacion.getFilasProcesadas());
        } else {
            EstadoCarga estadoConErrores = estadoCargaRepository.findByCodigo("CON_ERRORES")
                    .orElseThrow(() -> new RuntimeException("Estado CON_ERRORES no encontrado"));
            proceso.setEstadoCarga(estadoConErrores);
        }

        resultadoCargaRepository.save(resultado);
        procesoCargaRepository.save(proceso);

        for (Long campaniaId : resultadoImportacion.getCampaniasAfectadas()) {
            try {
                campaniaService.recalcularMetricas(campaniaId);
            } catch (Exception e) {
                log.warn("Error al recalcular métricas de campaña {}: {}", campaniaId, e.getMessage());
            }
        }

        if (resultadoImportacion.getCampaniasAfectadas().isEmpty()) {
            try {
                campaniaService.recalcularMetricasPorProcesoCarga(procesoCargaId);
            } catch (Exception e) {
                log.warn("Error al recalcular métricas por proceso de carga {}: {}", procesoCargaId, e.getMessage());
            }
        }
    }
}

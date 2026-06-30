package pe.com.banco.bi.module2.common.processor;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AsyncCargaProcessorTest {

    @Mock
    private ProcesoCargaRepository procesoCargaRepository;

    @Mock
    private ArchivoCargaRepository archivoCargaRepository;

    @Mock
    private DetalleCargaRepository detalleCargaRepository;

    @Mock
    private ErrorCargaRepository errorCargaRepository;

    @Mock
    private ResultadoCargaRepository resultadoCargaRepository;

    @Mock
    private EstadoCargaRepository estadoCargaRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private AsyncCargaProcessor asyncCargaProcessor;

    @Test
    void procesarCarga_archivoValido_debeDejarEstadoValidada() {
        EstadoCarga enValidacion = EstadoCarga.builder().id(2L).codigo("EN_VALIDACION").nombre("En validación").build();
        EstadoCarga validada = EstadoCarga.builder().id(3L).codigo("VALIDADA").nombre("Validada").build();

        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(1L)
                .codigo("CARGA-001")
                .totalRegistros(0)
                .totalRegValidos(0)
                .totalRegInvalidos(0)
                .build();

        ArchivoCarga archivo = ArchivoCarga.builder()
                .id(1L)
                .nombreArchivo("campanias_validas.csv")
                .rutaArchivo("campanias_validas.csv")
                .procesoCarga(proceso)
                .build();

        when(procesoCargaRepository.findById(1L)).thenReturn(Optional.of(proceso));
        when(archivoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.of(archivo));
        when(estadoCargaRepository.findByCodigo("EN_VALIDACION")).thenReturn(Optional.of(enValidacion));
        when(estadoCargaRepository.findByCodigo("VALIDADA")).thenReturn(Optional.of(validada));
        when(storageService.loadAsInputStream("campanias_validas.csv"))
                .thenReturn(new ByteArrayInputStream("C1,N1\nC2,N2\nC3,N3\n".getBytes(StandardCharsets.UTF_8)));
        when(procesoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(resultadoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        asyncCargaProcessor.procesarCarga(1L);

        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("VALIDADA");
        assertThat(proceso.getTotalRegistros()).isEqualTo(3);
        assertThat(proceso.getTotalRegValidos()).isEqualTo(3);
        assertThat(proceso.getTotalRegInvalidos()).isEqualTo(0);

        verify(detalleCargaRepository).saveAll(any());
        verify(errorCargaRepository).saveAll(any());
        verify(resultadoCargaRepository).save(any());
    }

    @Test
    void procesarCarga_archivoConErrores_debeDejarEstadoConErrores() {
        EstadoCarga enValidacion = EstadoCarga.builder().id(2L).codigo("EN_VALIDACION").nombre("En validación").build();
        EstadoCarga conErrores = EstadoCarga.builder().id(4L).codigo("CON_ERRORES").nombre("Con errores").build();

        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(2L)
                .codigo("CARGA-002")
                .totalRegistros(0)
                .totalRegValidos(0)
                .totalRegInvalidos(0)
                .build();

        ArchivoCarga archivo = ArchivoCarga.builder()
                .id(2L)
                .nombreArchivo("campanias_con_errores.csv")
                .rutaArchivo("campanias_con_errores.csv")
                .procesoCarga(proceso)
                .build();

        when(procesoCargaRepository.findById(2L)).thenReturn(Optional.of(proceso));
        when(archivoCargaRepository.findByProcesoCargaId(2L)).thenReturn(Optional.of(archivo));
        when(estadoCargaRepository.findByCodigo("EN_VALIDACION")).thenReturn(Optional.of(enValidacion));
        when(estadoCargaRepository.findByCodigo("CON_ERRORES")).thenReturn(Optional.of(conErrores));
        when(storageService.loadAsInputStream("campanias_con_errores.csv"))
                .thenReturn(new ByteArrayInputStream("C1,\n".getBytes(StandardCharsets.UTF_8)));
        when(procesoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(resultadoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        asyncCargaProcessor.procesarCarga(2L);

        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("CON_ERRORES");
        assertThat(proceso.getTotalRegistros()).isEqualTo(1);
        assertThat(proceso.getTotalRegValidos()).isEqualTo(0);
        assertThat(proceso.getTotalRegInvalidos()).isEqualTo(1);

        ArgumentCaptor<ErrorCarga> captorError = ArgumentCaptor.forClass(ErrorCarga.class);
        verify(errorCargaRepository).saveAll(argThat(list -> {
            java.util.List<ErrorCarga> errores = (java.util.List<ErrorCarga>) list;
            return errores.stream().anyMatch(e -> "VALIDACION".equals(e.getTipoError()));
        }));
    }
}

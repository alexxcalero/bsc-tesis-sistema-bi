package pe.com.banco.bi.module2.procesocarga.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.entity.TipoCarga;
import pe.com.banco.bi.catalog.repository.EstadoCargaRepository;
import pe.com.banco.bi.catalog.repository.TipoCargaRepository;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;
import pe.com.banco.bi.module2.archivocarga.repository.ArchivoCargaRepository;
import pe.com.banco.bi.module2.common.event.CargaRegistradaEvent;
import pe.com.banco.bi.module2.common.importer.CargaDataImporter;
import pe.com.banco.bi.module2.common.importer.CargaImporterFactory;
import pe.com.banco.bi.module2.common.importer.ImportError;
import pe.com.banco.bi.module2.common.importer.ImportResult;
import pe.com.banco.bi.module2.common.storage.StorageService;
import pe.com.banco.bi.module2.detallecarga.entity.DetalleCarga;
import pe.com.banco.bi.module2.detallecarga.repository.DetalleCargaRepository;
import pe.com.banco.bi.module2.errorcarga.entity.ErrorCarga;
import pe.com.banco.bi.module2.errorcarga.repository.ErrorCargaRepository;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaRequest;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResponse;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.procesocarga.mapper.ProcesoCargaMapper;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;
import pe.com.banco.bi.module2.resultadocarga.repository.ResultadoCargaRepository;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;
import pe.com.banco.bi.securitydomain.usuario.repository.UsuarioRepository;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcesoCargaServiceImplTest {

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
    private TipoCargaRepository tipoCargaRepository;

    @Mock
    private EstadoCargaRepository estadoCargaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Mock
    private ProcesoCargaMapper procesoCargaMapper;

    @Mock
    private CampaniaService campaniaService;

    @Mock
    private CargaImporterFactory importerFactory;

    @Mock
    private CargaDataImporter importer;

    @Mock
    private jakarta.persistence.EntityManager entityManager;

    @InjectMocks
    private ProcesoCargaServiceImpl procesoCargaService;

    @Test
    void registrarCarga_debeGenerarCodigoPendienteYPublicarEvento() throws IOException {
        TipoCarga tipoCarga = TipoCarga.builder().id(1L).codigo("CAMPANIAS").nombre("Campañas").activo(true).build();
        EstadoCarga estadoPendiente = EstadoCarga.builder().id(1L).codigo("PENDIENTE").nombre("Pendiente").activo(true).build();
        Usuario usuario = Usuario.builder().id(1L).username("especialista").build();

        when(tipoCargaRepository.findById(1L)).thenReturn(Optional.of(tipoCarga));
        when(estadoCargaRepository.findByCodigo("PENDIENTE")).thenReturn(Optional.of(estadoPendiente));
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(storageService.store(any(), any())).thenReturn("stored-file.csv");

        ProcesoCarga procesoGuardado = ProcesoCarga.builder()
                .id(1L)
                .codigo("CARGA-ABC12345")
                .tipoCarga(tipoCarga)
                .estadoCarga(estadoPendiente)
                .usuario(usuario)
                .totalRegistros(0)
                .totalRegValidos(0)
                .totalRegInvalidos(0)
                .build();

        when(procesoCargaRepository.save(any(ProcesoCarga.class))).thenReturn(procesoGuardado);
        when(procesoCargaMapper.toResponse(any())).thenReturn(ProcesoCargaResponse.builder().id(1L).build());
        when(archivoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.empty());
        when(resultadoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.empty());

        MultipartFile file = new MockMultipartFile("archivo", "campanias_validas.csv", "text/csv", "codigo,nombre\nC1,N1\n".getBytes());
        ProcesoCargaRequest request = ProcesoCargaRequest.builder().tipoCargaId(1L).observacion("Prueba").build();

        ProcesoCargaResponse respuesta = procesoCargaService.registrarCarga(request, file, 1L);

        assertThat(respuesta).isNotNull();
        assertThat(respuesta.getId()).isEqualTo(1L);

        ArgumentCaptor<ProcesoCarga> captorProceso = ArgumentCaptor.forClass(ProcesoCarga.class);
        verify(procesoCargaRepository).save(captorProceso.capture());
        ProcesoCarga proceso = captorProceso.getValue();
        assertThat(proceso.getCodigo()).startsWith("CARGA-");
        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("PENDIENTE");

        ArgumentCaptor<ArchivoCarga> captorArchivo = ArgumentCaptor.forClass(ArchivoCarga.class);
        verify(archivoCargaRepository).save(captorArchivo.capture());
        assertThat(captorArchivo.getValue().getNombreArchivo()).isEqualTo("campanias_validas.csv");

        ArgumentCaptor<CargaRegistradaEvent> captorEvento = ArgumentCaptor.forClass(CargaRegistradaEvent.class);
        verify(eventPublisher).publishEvent(captorEvento.capture());
        assertThat(captorEvento.getValue().procesoCargaId()).isEqualTo(1L);
    }

    @Test
    void publicarCarga_estadoValidada_debePublicarYActualizarResultado() {
        TipoCarga tipoCarga = TipoCarga.builder().id(1L).codigo("CAMPANIAS").nombre("Campañas").activo(true).build();
        EstadoCarga estadoValidada = EstadoCarga.builder().id(2L).codigo("VALIDADA").nombre("Validada").activo(true).build();
        EstadoCarga estadoPublicada = EstadoCarga.builder().id(4L).codigo("PUBLICADA").nombre("Publicada").activo(true).build();
        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(1L)
                .codigo("CARGA-001")
                .tipoCarga(tipoCarga)
                .estadoCarga(estadoValidada)
                .totalRegistros(1)
                .totalRegValidos(1)
                .totalRegInvalidos(0)
                .build();
        ResultadoCarga resultado = ResultadoCarga.builder().id(1L).totalRegistros(1).totalRegistrosValidos(1).totalRegistrosInvalidos(0).totalRegistrosProcesados(0).build();

        List<DetalleCarga> detalles = List.of(
                DetalleCarga.builder().id(1L).numeroFila(2).datosFila("C1,N1").esValido(true).procesoCarga(proceso).build()
        );

        when(procesoCargaRepository.findById(1L)).thenReturn(Optional.of(proceso));
        when(estadoCargaRepository.findByCodigo("PUBLICADA")).thenReturn(Optional.of(estadoPublicada));
        when(resultadoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.of(resultado));
        when(detalleCargaRepository.findByProcesoCargaId(1L)).thenReturn(detalles);
        when(importerFactory.resolver("CAMPANIAS")).thenReturn(importer);
        when(importer.importar(eq(1L), anyList())).thenReturn(ImportResult.builder()
                .totalFilas(1)
                .filasProcesadas(1)
                .errores(new ArrayList<>())
                .campaniasAfectadas(new HashSet<>())
                .build());
        when(procesoCargaMapper.toResponse(any())).thenReturn(ProcesoCargaResponse.builder().id(1L).build());
        when(resultadoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        procesoCargaService.publicarCarga(1L);

        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("PUBLICADA");
        assertThat(resultado.getTotalRegistrosProcesados()).isEqualTo(1);
        verify(importer).importar(eq(1L), anyList());
        verify(errorCargaRepository).deleteByProcesoCargaIdAndTipoError(1L, "IMPORTACION");
    }

    @Test
    void publicarCarga_conErroresPeroFilasProcesadas_debePublicarParcialmente() {
        TipoCarga tipoCarga = TipoCarga.builder().id(1L).codigo("CAMPANIAS").nombre("Campañas").activo(true).build();
        EstadoCarga estadoConErrores = EstadoCarga.builder().id(5L).codigo("CON_ERRORES").nombre("Con Errores").activo(true).build();
        EstadoCarga estadoPublicada = EstadoCarga.builder().id(4L).codigo("PUBLICADA").nombre("Publicada").activo(true).build();
        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(1L)
                .codigo("CARGA-001")
                .tipoCarga(tipoCarga)
                .estadoCarga(estadoConErrores)
                .totalRegistros(2)
                .totalRegValidos(1)
                .totalRegInvalidos(1)
                .build();
        ResultadoCarga resultado = ResultadoCarga.builder().id(1L).totalRegistros(2).totalRegistrosValidos(1).totalRegistrosInvalidos(1).totalRegistrosProcesados(0).build();

        List<DetalleCarga> detalles = List.of(
                DetalleCarga.builder().id(1L).numeroFila(2).datosFila("C1,N1").esValido(true).procesoCarga(proceso).build(),
                DetalleCarga.builder().id(2L).numeroFila(3).datosFila("C2,N2").esValido(true).procesoCarga(proceso).build()
        );

        List<ImportError> errores = new ArrayList<>();
        errores.add(ImportError.builder()
                .numeroFila(2)
                .campo("GENERAL")
                .tipoError("IMPORTACION")
                .mensajeError("Fila 2: error inesperado")
                .build());

        when(procesoCargaRepository.findById(1L)).thenReturn(Optional.of(proceso));
        when(estadoCargaRepository.findByCodigo("PUBLICADA")).thenReturn(Optional.of(estadoPublicada));
        when(resultadoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.of(resultado));
        when(detalleCargaRepository.findByProcesoCargaId(1L)).thenReturn(detalles);
        when(importerFactory.resolver("CAMPANIAS")).thenReturn(importer);
        when(importer.importar(eq(1L), anyList())).thenReturn(ImportResult.builder()
                .totalFilas(2)
                .filasProcesadas(1)
                .errores(errores)
                .campaniasAfectadas(new HashSet<>())
                .build());
        when(procesoCargaMapper.toResponse(any())).thenReturn(ProcesoCargaResponse.builder().id(1L).build());
        when(resultadoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(errorCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        procesoCargaService.publicarCarga(1L);

        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("PUBLICADA");
        assertThat(resultado.getTotalRegistrosProcesados()).isEqualTo(1);
        verify(errorCargaRepository).save(any());
        verify(errorCargaRepository).deleteByProcesoCargaIdAndTipoError(1L, "IMPORTACION");
        verify(importer).importar(eq(1L), anyList());
    }

    @Test
    void publicarCarga_conErroresTotales_debeQuedarConErrores() {
        TipoCarga tipoCarga = TipoCarga.builder().id(1L).codigo("CAMPANIAS").nombre("Campañas").activo(true).build();
        EstadoCarga estadoValidada = EstadoCarga.builder().id(2L).codigo("VALIDADA").nombre("Validada").activo(true).build();
        EstadoCarga estadoConErrores = EstadoCarga.builder().id(5L).codigo("CON_ERRORES").nombre("Con Errores").activo(true).build();
        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(1L)
                .codigo("CARGA-001")
                .tipoCarga(tipoCarga)
                .estadoCarga(estadoValidada)
                .totalRegistros(1)
                .totalRegValidos(0)
                .totalRegInvalidos(1)
                .build();
        ResultadoCarga resultado = ResultadoCarga.builder().id(1L).totalRegistros(1).totalRegistrosValidos(0).totalRegistrosInvalidos(1).totalRegistrosProcesados(0).build();

        List<DetalleCarga> detalles = List.of(
                DetalleCarga.builder().id(1L).numeroFila(2).datosFila("C1,N1").esValido(true).procesoCarga(proceso).build()
        );

        List<ImportError> errores = new ArrayList<>();
        errores.add(ImportError.builder()
                .numeroFila(2)
                .campo("GENERAL")
                .tipoError("IMPORTACION")
                .mensajeError("Fila 2: error inesperado")
                .build());

        when(procesoCargaRepository.findById(1L)).thenReturn(Optional.of(proceso));
        when(estadoCargaRepository.findByCodigo("CON_ERRORES")).thenReturn(Optional.of(estadoConErrores));
        when(resultadoCargaRepository.findByProcesoCargaId(1L)).thenReturn(Optional.of(resultado));
        when(detalleCargaRepository.findByProcesoCargaId(1L)).thenReturn(detalles);
        when(importerFactory.resolver("CAMPANIAS")).thenReturn(importer);
        when(importer.importar(eq(1L), anyList())).thenReturn(ImportResult.builder()
                .totalFilas(1)
                .filasProcesadas(0)
                .errores(errores)
                .campaniasAfectadas(new HashSet<>())
                .build());
        when(procesoCargaMapper.toResponse(any())).thenReturn(ProcesoCargaResponse.builder().id(1L).build());
        when(resultadoCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(errorCargaRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        procesoCargaService.publicarCarga(1L);

        assertThat(proceso.getEstadoCarga().getCodigo()).isEqualTo("CON_ERRORES");
        assertThat(resultado.getTotalRegistrosProcesados()).isEqualTo(0);
        verify(errorCargaRepository).save(any());
        verify(errorCargaRepository).deleteByProcesoCargaIdAndTipoError(1L, "IMPORTACION");
        verify(importer).importar(eq(1L), anyList());
    }

    @Test
    void publicarCarga_estadoPendiente_debeLanzarExcepcion() {
        EstadoCarga estadoPendiente = EstadoCarga.builder().id(1L).codigo("PENDIENTE").nombre("Pendiente").activo(true).build();
        ProcesoCarga proceso = ProcesoCarga.builder()
                .id(3L)
                .codigo("CARGA-003")
                .estadoCarga(estadoPendiente)
                .build();

        when(procesoCargaRepository.findById(3L)).thenReturn(Optional.of(proceso));

        assertThatThrownBy(() -> procesoCargaService.publicarCarga(3L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Solo se pueden publicar cargas validadas o con errores");

        verify(procesoCargaRepository, never()).save(any());
    }
}

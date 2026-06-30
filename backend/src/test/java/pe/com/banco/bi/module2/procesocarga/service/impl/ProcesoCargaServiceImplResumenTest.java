package pe.com.banco.bi.module2.procesocarga.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import pe.com.banco.bi.catalog.repository.EstadoCargaRepository;
import pe.com.banco.bi.catalog.repository.TipoCargaRepository;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module2.archivocarga.repository.ArchivoCargaRepository;
import pe.com.banco.bi.module2.common.storage.StorageService;
import pe.com.banco.bi.module2.detallecarga.repository.DetalleCargaRepository;
import pe.com.banco.bi.module2.errorcarga.repository.ErrorCargaRepository;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResumenResponse;
import pe.com.banco.bi.module2.procesocarga.mapper.ProcesoCargaMapper;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.module2.resultadocarga.repository.ResultadoCargaRepository;
import pe.com.banco.bi.securitydomain.usuario.repository.UsuarioRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProcesoCargaServiceImplResumenTest {

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
    private EntityManager entityManager;

    @InjectMocks
    private ProcesoCargaServiceImpl procesoCargaService;

    @Test
    void resumenCargas_sinFiltros_debeRetornarTotalesAcumulados() {
        when(procesoCargaRepository.count(any(Specification.class))).thenReturn(5L, 1L, 0L, 2L, 1L, 1L, 0L);

        CriteriaBuilder cb = mock(CriteriaBuilder.class, RETURNS_DEEP_STUBS);
        CriteriaQuery<Object[]> query = mock(CriteriaQuery.class, RETURNS_DEEP_STUBS);
        TypedQuery<Object[]> typedQuery = mock(TypedQuery.class);

        when(entityManager.getCriteriaBuilder()).thenReturn(cb);
        when(cb.createQuery(Object[].class)).thenReturn(query);
        when(entityManager.createQuery(any(CriteriaQuery.class))).thenReturn(typedQuery);
        when(typedQuery.getSingleResult()).thenReturn(new Object[]{100L, 80L, 20L});

        ProcesoCargaResumenResponse resumen = procesoCargaService.resumenCargas(null, null, null, null, null, null);

        assertThat(resumen.getTotal()).isEqualTo(5L);
        assertThat(resumen.getPendientes()).isEqualTo(1L);
        assertThat(resumen.getValidadas()).isEqualTo(2L);
        assertThat(resumen.getTotalRegistros()).isEqualTo(100L);
        assertThat(resumen.getTotalRegValidos()).isEqualTo(80L);
        assertThat(resumen.getTotalRegInvalidos()).isEqualTo(20L);
    }
}

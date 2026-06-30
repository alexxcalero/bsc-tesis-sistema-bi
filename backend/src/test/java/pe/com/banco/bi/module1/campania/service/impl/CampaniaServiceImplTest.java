package pe.com.banco.bi.module1.campania.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.dto.CampaniaResumenResponse;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.mapper.CampaniaMapper;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.oferta.dto.OfertaResumenResponse;
import pe.com.banco.bi.module1.oferta.dto.OfertaResumenTotales;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
import pe.com.banco.bi.module1.oferta.mapper.OfertaMapper;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CampaniaServiceImplTest {

    @Mock
    private CampaniaRepository campaniaRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private CampaniaMapper campaniaMapper;

    @Mock
    private OfertaMapper ofertaMapper;

    @InjectMocks
    private CampaniaServiceImpl campaniaService;

    @Test
    void recalcularMetricas_debeActualizarClientesMontoYTicketPromedio() {
        // Given
        Cliente cliente1 = Cliente.builder().id(1L).primerNombre("Juan").build();
        Cliente cliente2 = Cliente.builder().id(2L).primerNombre("Maria").build();

        Campania campania = Campania.builder()
                .id(1L)
                .codigo("CAMP-001")
                .nombre("Campaña Prueba")
                .estado("ACTIVA")
                .fechaInicio(LocalDate.now())
                .clientesAlcanzados(0)
                .montoOfertado(BigDecimal.ZERO)
                .ticketPromedio(BigDecimal.ZERO)
                .build();

        Oferta oferta1 = Oferta.builder()
                .id(1L)
                .monto(new BigDecimal("15000.00"))
                .estado("ACEPTADA")
                .fechaOferta(LocalDate.now())
                .campania(campania)
                .cliente(cliente1)
                .build();

        Oferta oferta2 = Oferta.builder()
                .id(2L)
                .monto(new BigDecimal("25000.00"))
                .estado("PENDIENTE")
                .fechaOferta(LocalDate.now())
                .campania(campania)
                .cliente(cliente2)
                .build();

        when(campaniaRepository.findById(1L)).thenReturn(Optional.of(campania));
        when(ofertaRepository.findAllByCampaniaId(1L)).thenReturn(List.of(oferta1, oferta2));
        when(campaniaRepository.save(any(Campania.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(campaniaMapper.toResponse(any(Campania.class))).thenAnswer(invocation -> {
            Campania c = invocation.getArgument(0);
            return CampaniaResponse.builder()
                    .id(c.getId())
                    .codigo(c.getCodigo())
                    .nombre(c.getNombre())
                    .estado(c.getEstado())
                    .clientesAlcanzados(c.getClientesAlcanzados())
                    .montoOfertado(c.getMontoOfertado())
                    .ticketPromedio(c.getTicketPromedio())
                    .build();
        });

        // When
        CampaniaResponse resultado = campaniaService.recalcularMetricas(1L);

        // Then
        assertThat(resultado.getClientesAlcanzados()).isEqualTo(2);
        assertThat(resultado.getMontoOfertado()).isEqualByComparingTo(new BigDecimal("40000.00"));
        assertThat(resultado.getTicketPromedio()).isEqualByComparingTo(new BigDecimal("20000.00"));

        verify(campaniaRepository).findById(1L);
        verify(ofertaRepository).findAllByCampaniaId(1L);
        verify(campaniaRepository).save(campania);
    }

    @Test
    @SuppressWarnings("unchecked")
    void listarCampanias_debeAplicarFiltrosYPaginar() {
        Campania campania = Campania.builder()
                .id(1L)
                .codigo("CAMP-001")
                .nombre("Campaña Prueba")
                .estado("ACTIVA")
                .build();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Campania> page = new PageImpl<>(List.of(campania), pageable, 1);

        when(campaniaRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(campaniaMapper.toResponse(any(Campania.class))).thenAnswer(invocation -> {
            Campania c = invocation.getArgument(0);
            return CampaniaResponse.builder()
                    .id(c.getId())
                    .codigo(c.getCodigo())
                    .nombre(c.getNombre())
                    .estado(c.getEstado())
                    .build();
        });

        Page<CampaniaResponse> resultado = campaniaService.listarCampanias("CAMP", null, null, null, "ACTIVA", pageable);

        assertThat(resultado.getContent()).hasSize(1);
        assertThat(resultado.getContent().get(0).getCodigo()).isEqualTo("CAMP-001");
        assertThat(resultado.getTotalElements()).isEqualTo(1);
        verify(campaniaRepository).findAll(any(Specification.class), any(Pageable.class));
    }

    @Test
    void resumenCampanias_debeRetornarTotalYActivas() {
        when(campaniaRepository.count(any(Specification.class))).thenReturn(5L);

        CampaniaResumenResponse resultado = campaniaService.resumenCampanias(null, null, null, null, null);

        assertThat(resultado.getTotal()).isEqualTo(5L);
        assertThat(resultado.getActivas()).isEqualTo(5L);
    }

    @Test
    void resumenOfertasPorCampania_debeCalcularTotalesCorrectamente() {
        when(campaniaRepository.existsById(1L)).thenReturn(true);
        when(ofertaRepository.calcularResumenOfertas(1L, "%"))
                .thenReturn(new OfertaResumenTotales(2L, 2L, new BigDecimal("40000.00")));

        OfertaResumenResponse resultado = campaniaService.resumenOfertasPorCampania(1L, null);

        assertThat(resultado.getTotalOfertas()).isEqualTo(2L);
        assertThat(resultado.getClientesAlcanzados()).isEqualTo(2L);
        assertThat(resultado.getMontoTotalOfertado()).isEqualByComparingTo(new BigDecimal("40000.00"));
        assertThat(resultado.getTicketPromedio()).isEqualByComparingTo(new BigDecimal("20000.00"));
    }
}

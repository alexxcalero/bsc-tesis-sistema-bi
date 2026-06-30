package pe.com.banco.bi.module1.dashboard.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.dashboard.dto.DashboardResponse;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private CampaniaRepository campaniaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    void obtenerDashboard_debeRetornarKpisYSeries() {
        when(campaniaRepository.count()).thenReturn(5L);
        when(clienteRepository.count()).thenReturn(100L);
        when(ofertaRepository.count()).thenReturn(250L);
        when(ofertaRepository.sumMontoTotal()).thenReturn(new BigDecimal("500000.00"));
        when(ofertaRepository.promedioMontoTotal()).thenReturn(new BigDecimal("2000.00"));
        List<Object[]> campaniasPorProducto = Arrays.<Object[]>asList(
                new Object[]{"Crédito", 3L},
                new Object[]{"Tarjeta", 2L});
        when(campaniaRepository.countCampaniasByProducto()).thenReturn(campaniasPorProducto);

        List<Object[]> evolucionVacia = new ArrayList<>();
        when(ofertaRepository.calcularEvolucionMonto(java.time.LocalDate.now().minusMonths(11).withDayOfMonth(1)))
                .thenReturn(evolucionVacia);

        List<Object[]> ticketPorSegmento = Arrays.<Object[]>asList(
                new Object[]{"Premium", new BigDecimal("5000.00")});
        when(ofertaRepository.calcularTicketPromedioPorSegmento()).thenReturn(ticketPorSegmento);

        DashboardResponse resultado = dashboardService.obtenerDashboard();

        assertThat(resultado.getKpis()).isNotNull();
        assertThat(resultado.getKpis().getTotalCampanias()).isEqualTo(5L);
        assertThat(resultado.getKpis().getTotalClientes()).isEqualTo(100L);
        assertThat(resultado.getKpis().getTotalOfertas()).isEqualTo(250L);
        assertThat(resultado.getKpis().getMontoTotalOfertado()).isEqualTo(500000.00);
        assertThat(resultado.getKpis().getTicketPromedio()).isEqualTo(2000.00);
        assertThat(resultado.getCampaniasPorProducto()).hasSize(2);
        assertThat(resultado.getEvolucionMonto()).hasSize(12);
        assertThat(resultado.getTicketPromedioPorSegmento()).hasSize(1);
    }
}

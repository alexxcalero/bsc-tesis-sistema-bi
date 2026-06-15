package pe.com.banco.bi.module1.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.dashboard.dto.DashboardKpiResponse;
import pe.com.banco.bi.module1.dashboard.dto.DashboardResponse;
import pe.com.banco.bi.module1.dashboard.dto.SerieData;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CampaniaRepository campaniaRepository;
    private final ClienteRepository clienteRepository;
    private final OfertaRepository ofertaRepository;

    @Transactional(readOnly = true)
    public DashboardResponse obtenerDashboard() {
        long totalCampanias = campaniaRepository.count();
        long totalClientes = clienteRepository.count();
        long totalOfertas = ofertaRepository.count();

        Double montoTotal = ofertaRepository.findAll().stream()
                .map(o -> o.getMonto() != null ? o.getMonto() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .doubleValue();

        Double ticketPromedio = totalOfertas > 0 ? montoTotal / totalOfertas : 0.0;

        return DashboardResponse.builder()
                .kpis(DashboardKpiResponse.builder()
                        .totalCampanias(totalCampanias)
                        .totalClientes(totalClientes)
                        .totalOfertas(totalOfertas)
                        .montoTotalOfertado(montoTotal)
                        .ticketPromedio(ticketPromedio)
                        .tasaConversion(0.0)
                        .build())
                .campaniasPorProducto(calcularCampaniasPorProducto())
                .evolucionMonto(new ArrayList<>())
                .ticketPromedioPorSegmento(new ArrayList<>())
                .build();
    }

    private List<SerieData> calcularCampaniasPorProducto() {
        List<SerieData> data = new ArrayList<>();
        campaniaRepository.findAll().forEach(c -> {
            String producto = c.getProducto() != null ? c.getProducto().getNombre() : "Sin producto";
            data.add(SerieData.builder().label(producto).valor(1.0).build());
        });
        return data;
    }
}

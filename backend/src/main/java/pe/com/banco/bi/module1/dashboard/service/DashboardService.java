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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        BigDecimal montoTotal = ofertaRepository.sumMontoTotal();
        BigDecimal ticketPromedio = ofertaRepository.promedioMontoTotal();

        return DashboardResponse.builder()
                .kpis(DashboardKpiResponse.builder()
                        .totalCampanias(totalCampanias)
                        .totalClientes(totalClientes)
                        .totalOfertas(totalOfertas)
                        .montoTotalOfertado(montoTotal.doubleValue())
                        .ticketPromedio(ticketPromedio.doubleValue())
                        .tasaConversion(0.0)
                        .build())
                .campaniasPorProducto(calcularCampaniasPorProducto())
                .evolucionMonto(calcularEvolucionMonto())
                .ticketPromedioPorSegmento(calcularTicketPromedioPorSegmento())
                .build();
    }

    private List<SerieData> calcularCampaniasPorProducto() {
        List<Object[]> resultado = campaniaRepository.countCampaniasByProducto();
        return resultado.stream()
                .map(row -> SerieData.builder()
                        .label((String) row[0])
                        .valor(((Number) row[1]).doubleValue())
                        .build())
                .toList();
    }

    private List<SerieData> calcularEvolucionMonto() {
        LocalDate fechaDesde = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        List<Object[]> resultado = ofertaRepository.calcularEvolucionMonto(fechaDesde);

        Map<String, BigDecimal> valoresPorMes = resultado.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> toBigDecimal(row[1]),
                        (a, b) -> a
                ));

        List<SerieData> serie = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 11; i >= 0; i--) {
            LocalDate mes = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            String label = mes.format(formatter);
            String key = mes.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            BigDecimal valor = valoresPorMes.getOrDefault(key, BigDecimal.ZERO);
            serie.add(SerieData.builder().label(label).valor(valor.doubleValue()).build());
        }
        return serie;
    }

    private List<SerieData> calcularTicketPromedioPorSegmento() {
        List<Object[]> resultado = ofertaRepository.calcularTicketPromedioPorSegmento();
        return resultado.stream()
                .map(row -> SerieData.builder()
                        .label((String) row[0])
                        .valor(toBigDecimal(row[1]).setScale(2, RoundingMode.HALF_UP).doubleValue())
                        .build())
                .toList();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal bd) {
            return bd;
        }
        if (value instanceof Number n) {
            return BigDecimal.valueOf(n.doubleValue());
        }
        return new BigDecimal(value.toString());
    }

}

package pe.com.banco.bi.module1.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.dashboard.dto.DashboardFiltroRequest;
import pe.com.banco.bi.module1.dashboard.dto.DashboardKpiResponse;
import pe.com.banco.bi.module1.dashboard.dto.DashboardResponse;
import pe.com.banco.bi.module1.dashboard.dto.SerieComparativa;
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
        return obtenerDashboard(null);
    }

    @Transactional(readOnly = true)
    public DashboardResponse obtenerDashboard(DashboardFiltroRequest filtros) {
        if (filtros == null || !filtros.tieneAlgunFiltro()) {
            return obtenerDashboardSinFiltros();
        }
        return obtenerDashboardConFiltros(filtros);
    }

    private DashboardResponse obtenerDashboardSinFiltros() {
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

    private DashboardResponse obtenerDashboardConFiltros(DashboardFiltroRequest filtros) {
        LocalDate fechaDesde = filtros.getFechaDesde();
        LocalDate fechaHasta = filtros.getFechaHasta();
        String estadoCampania = filtros.getEstadoCampania();
        Long productoId = filtros.getProductoId();
        List<Long> periodoIds = filtros.getPeriodoIds() != null && !filtros.getPeriodoIds().isEmpty()
                ? filtros.getPeriodoIds() : null;
        Long segmentoId = filtros.getSegmentoId();

        List<Object[]> resultado = ofertaRepository.calcularKpisConFiltros(
                fechaDesde, fechaHasta, estadoCampania, productoId, periodoIds, segmentoId);

        Object[] kpis = resultado.isEmpty()
                ? new Object[]{0L, 0L, 0L, BigDecimal.ZERO, BigDecimal.ZERO}
                : resultado.get(0);

        long totalCampanias = ((Number) kpis[0]).longValue();
        long totalClientes = ((Number) kpis[1]).longValue();
        long totalOfertas = ((Number) kpis[2]).longValue();
        BigDecimal montoTotal = toBigDecimal(kpis[3]);
        BigDecimal ticketPromedio = toBigDecimal(kpis[4]);

        return DashboardResponse.builder()
                .kpis(DashboardKpiResponse.builder()
                        .totalCampanias(totalCampanias)
                        .totalClientes(totalClientes)
                        .totalOfertas(totalOfertas)
                        .montoTotalOfertado(montoTotal.doubleValue())
                        .ticketPromedio(ticketPromedio.doubleValue())
                        .tasaConversion(0.0)
                        .build())
                .campaniasPorProducto(calcularCampaniasPorProductoConFiltros(filtros, periodoIds))
                .evolucionMonto(calcularEvolucionMontoConFiltros(filtros, periodoIds))
                .ticketPromedioPorSegmento(calcularTicketPromedioPorSegmentoConFiltros(filtros, periodoIds))
                .build();
    }

    private List<SerieComparativa> calcularCampaniasPorProducto() {
        List<Object[]> resultado = campaniaRepository.countCampaniasByProducto();
        return resultado.stream()
                .map(row -> SerieComparativa.builder()
                        .periodo("")
                        .label((String) row[0])
                        .valor(((Number) row[1]).doubleValue())
                        .build())
                .toList();
    }

    private List<SerieComparativa> calcularCampaniasPorProductoConFiltros(DashboardFiltroRequest filtros, List<Long> periodoIds) {
        List<Object[]> resultado = ofertaRepository.countCampaniasByProductoConFiltros(
                filtros.getFechaDesde(),
                filtros.getFechaHasta(),
                filtros.getEstadoCampania(),
                filtros.getProductoId(),
                periodoIds,
                filtros.getSegmentoId());
        return resultado.stream()
                .map(row -> SerieComparativa.builder()
                        .periodo((String) row[0])
                        .label((String) row[1])
                        .valor(((Number) row[2]).doubleValue())
                        .build())
                .toList();
    }

    private List<SerieComparativa> calcularEvolucionMonto() {
        LocalDate fechaDesde = LocalDate.now().minusMonths(11).withDayOfMonth(1);
        List<Object[]> resultado = ofertaRepository.calcularEvolucionMonto(fechaDesde);
        return completarSerieMensual(resultado, fechaDesde, LocalDate.now());
    }

    private List<SerieComparativa> calcularEvolucionMontoConFiltros(DashboardFiltroRequest filtros, List<Long> periodoIds) {
        List<Object[]> resultado = ofertaRepository.calcularEvolucionMontoConFiltros(
                filtros.getFechaDesde(),
                filtros.getFechaHasta(),
                filtros.getEstadoCampania(),
                filtros.getProductoId(),
                periodoIds,
                filtros.getSegmentoId());
        return resultado.stream()
                .map(row -> SerieComparativa.builder()
                        .periodo((String) row[0])
                        .label((String) row[0])
                        .valor(toBigDecimal(row[1]).doubleValue())
                        .build())
                .toList();
    }

    private List<SerieComparativa> completarSerieMensual(List<Object[]> resultado, LocalDate fechaDesde, LocalDate fechaHasta) {
        Map<String, BigDecimal> valoresPorMes = resultado.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> toBigDecimal(row[1]),
                        (a, b) -> a
                ));

        List<SerieComparativa> serie = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        DateTimeFormatter keyFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        LocalDate inicio = fechaDesde.withDayOfMonth(1);
        LocalDate fin = fechaHasta.withDayOfMonth(1);
        while (!inicio.isAfter(fin)) {
            String label = inicio.format(formatter);
            String key = inicio.format(keyFormatter);
            BigDecimal valor = valoresPorMes.getOrDefault(key, BigDecimal.ZERO);
            serie.add(SerieComparativa.builder().periodo("").label(label).valor(valor.doubleValue()).build());
            inicio = inicio.plusMonths(1);
        }
        return serie;
    }

    private List<SerieComparativa> calcularTicketPromedioPorSegmento() {
        List<Object[]> resultado = ofertaRepository.calcularTicketPromedioPorSegmento();
        return resultado.stream()
                .map(row -> SerieComparativa.builder()
                        .periodo("")
                        .label((String) row[0])
                        .valor(toBigDecimal(row[1]).setScale(2, RoundingMode.HALF_UP).doubleValue())
                        .build())
                .toList();
    }

    private List<SerieComparativa> calcularTicketPromedioPorSegmentoConFiltros(DashboardFiltroRequest filtros, List<Long> periodoIds) {
        List<Object[]> resultado = ofertaRepository.calcularTicketPromedioPorSegmentoConFiltros(
                filtros.getFechaDesde(),
                filtros.getFechaHasta(),
                filtros.getEstadoCampania(),
                filtros.getProductoId(),
                periodoIds,
                filtros.getSegmentoId());
        return resultado.stream()
                .map(row -> SerieComparativa.builder()
                        .periodo((String) row[0])
                        .label((String) row[1])
                        .valor(toBigDecimal(row[2]).setScale(2, RoundingMode.HALF_UP).doubleValue())
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

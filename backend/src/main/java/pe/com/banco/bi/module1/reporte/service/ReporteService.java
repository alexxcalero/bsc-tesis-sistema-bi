package pe.com.banco.bi.module1.reporte.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.dashboard.dto.DashboardFiltroRequest;
import pe.com.banco.bi.module1.dashboard.dto.DashboardResponse;
import pe.com.banco.bi.module1.dashboard.service.DashboardService;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;
import pe.com.banco.bi.module1.reporte.dto.ReporteFiltroResponse;
import pe.com.banco.bi.module1.reporte.dto.ReporteResponse;
import pe.com.banco.bi.module1.reporte.entity.Reporte;
import pe.com.banco.bi.module1.reporte.repository.ReporteRepository;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final CampaniaRepository campaniaRepository;
    private final OfertaRepository ofertaRepository;
    private final ClienteRepository clienteRepository;
    private final ReporteRepository reporteRepository;
    private final DashboardService dashboardService;

    public List<ReporteResponse> listarReportes() {
        return reporteRepository.findAllByActivoTrueOrderByNombre().stream()
                .map(this::toResponse)
                .toList();
    }

    private ReporteResponse toResponse(Reporte reporte) {
        return ReporteResponse.builder()
                .id(reporte.getCodigo())
                .nombre(reporte.getNombre())
                .descripcion(reporte.getDescripcion())
                .formato(reporte.getFormato())
                .icono(reporte.getIcono())
                .filtros(reporte.getFiltros().stream()
                        .map(f -> ReporteFiltroResponse.builder()
                                .codigo(f.getCodigo())
                                .nombre(f.getNombre())
                                .tipo(f.getTipo())
                                .catalogoEndpoint(f.getCatalogoEndpoint())
                                .orden(f.getOrden())
                                .build())
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public InputStream generarReporte(String reporteId, Map<String, String> filtros) {
        Reporte reporte = reporteRepository.findByCodigoIgnoreCase(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reporteId));

        return switch (reporte.getCodigo()) {
            case "campanias" -> generarReporteCampanias(filtros);
            case "ofertas" -> generarReporteOfertas(filtros);
            case "clientes" -> generarReporteClientes(filtros);
            case "dashboard" -> generarReporteDashboard(filtros);
            default -> throw new RuntimeException("Generador no implementado para: " + reporteId);
        };
    }

    private InputStream generarReporteCampanias(Map<String, String> filtros) {
        List<Campania> campanias = campaniaRepository.findAll().stream()
                .filter(c -> filtroLong(filtros.get("periodoId"), c.getPeriodo() != null ? c.getPeriodo().getId() : null))
                .filter(c -> filtroLong(filtros.get("productoId"), c.getProducto() != null ? c.getProducto().getId() : null))
                .filter(c -> filtroString(filtros.get("estado"), c.getEstado()))
                .toList();

        List<Oferta> todasLasOfertas = ofertaRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("Codigo,Nombre,Periodo,Producto,Estado,Fecha Inicio,Fecha Fin,Total Clientes,Monto Total\n");

        for (Campania c : campanias) {
            List<Oferta> ofertasCampania = todasLasOfertas.stream()
                    .filter(o -> o.getCampania().getId().equals(c.getId()))
                    .toList();

            long totalClientes = ofertasCampania.stream()
                    .map(o -> o.getCliente().getId())
                    .distinct()
                    .count();

            BigDecimal montoTotal = ofertasCampania.stream()
                    .map(Oferta::getMonto)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            sb.append(String.format("%s,%s,%s,%s,%s,%s,%s,%d,%s\n",
                    escaparCsv(c.getCodigo()),
                    escaparCsv(c.getNombre()),
                    escaparCsv(c.getPeriodo() != null ? c.getPeriodo().getNombre() : ""),
                    escaparCsv(c.getProducto() != null ? c.getProducto().getNombre() : ""),
                    escaparCsv(c.getEstado()),
                    escaparCsv(c.getFechaInicio() != null ? c.getFechaInicio().toString() : ""),
                    escaparCsv(c.getFechaFin() != null ? c.getFechaFin().toString() : ""),
                    totalClientes,
                    montoTotal));
        }

        sb.append("\n");
        sb.append(",,,,,,TOTALES,,");
        long totalClientesGeneral = campanias.stream()
                .mapToLong(c -> todasLasOfertas.stream()
                        .filter(o -> o.getCampania().getId().equals(c.getId()))
                        .map(o -> o.getCliente().getId())
                        .distinct()
                        .count())
                .sum();
        BigDecimal montoTotalGeneral = campanias.stream()
                .map(c -> todasLasOfertas.stream()
                        .filter(o -> o.getCampania().getId().equals(c.getId()))
                        .map(Oferta::getMonto)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        sb.append(totalClientesGeneral).append(",").append(montoTotalGeneral).append("\n");

        return new ByteArrayInputStream(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    private InputStream generarReporteOfertas(Map<String, String> filtros) {
        LocalDate fechaDesde = parseFecha(filtros.get("fechaDesde"));
        LocalDate fechaHasta = parseFecha(filtros.get("fechaHasta"));

        List<Oferta> ofertas = ofertaRepository.findAll().stream()
                .filter(o -> filtroLong(filtros.get("campaniaId"), o.getCampania().getId()))
                .filter(o -> filtroLong(filtros.get("clienteId"), o.getCliente().getId()))
                .filter(o -> filtroString(filtros.get("estado"), o.getEstado()))
                .filter(o -> fechaDesde == null || (o.getFechaOferta() != null && !o.getFechaOferta().isBefore(fechaDesde)))
                .filter(o -> fechaHasta == null || (o.getFechaOferta() != null && !o.getFechaOferta().isAfter(fechaHasta)))
                .toList();

        StringBuilder sb = new StringBuilder();
        sb.append("Campaña,Cliente,Monto,Tasa,Fecha Oferta,Estado\n");

        for (Oferta o : ofertas) {
            sb.append(String.format("%s,%s,%s,%s,%s,%s\n",
                    escaparCsv(o.getCampania().getNombre()),
                    escaparCsv(buildNombreCliente(o.getCliente())),
                    o.getMonto(),
                    o.getTasa() != null ? o.getTasa() : "",
                    o.getFechaOferta(),
                    escaparCsv(o.getEstado())));
        }

        BigDecimal montoTotal = ofertas.stream()
                .map(Oferta::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double tasaPromedio = ofertas.stream()
                .map(Oferta::getTasa)
                .filter(Objects::nonNull)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.0);

        Map<String, Long> conteoPorEstado = ofertas.stream()
                .collect(Collectors.groupingBy(Oferta::getEstado, Collectors.counting()));

        sb.append("\n,,TOTALES,,,\n");
        sb.append(String.format(",,Monto Total: %s,,,\n", montoTotal));
        sb.append(String.format(",,Tasa Promedio: %.2f,,,\n", tasaPromedio));
        sb.append(",,Conteo por Estado,,,\n");
        conteoPorEstado.forEach((estado, count) ->
                sb.append(String.format(",,%s: %d,,,\n", estado, count)));

        return new ByteArrayInputStream(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    private InputStream generarReporteClientes(Map<String, String> filtros) {
        List<Cliente> clientes = clienteRepository.findAll().stream()
                .filter(c -> filtroLong(filtros.get("segmentoId"), c.getSegmento() != null ? c.getSegmento().getId() : null))
                .filter(c -> filtroLong(filtros.get("zonaId"), c.getZona() != null ? c.getZona().getId() : null))
                .filter(c -> filtroLong(filtros.get("agenciaId"), c.getAgencia() != null ? c.getAgencia().getId() : null))
                .toList();

        Long periodoId = parseLong(filtros.get("periodoId"));
        List<Oferta> ofertas = ofertaRepository.findAll();

        StringBuilder sb = new StringBuilder();
        sb.append("Cliente,Documento,Segmento,Zona,Ofertas Activas,Monto Total Ofertado,Tasa Promedio\n");

        BigDecimal montoTotalGeneral = BigDecimal.ZERO;
        int ofertasActivasGeneral = 0;

        for (Cliente c : clientes) {
            List<Oferta> ofertasCliente = ofertas.stream()
                    .filter(o -> o.getCliente().getId().equals(c.getId()))
                    .filter(o -> periodoId == null || (o.getCampania().getPeriodo() != null && o.getCampania().getPeriodo().getId().equals(periodoId)))
                    .toList();

            long ofertasActivas = ofertasCliente.stream()
                    .filter(o -> "ACEPTADA".equalsIgnoreCase(o.getEstado()))
                    .count();

            BigDecimal montoTotal = ofertasCliente.stream()
                    .map(Oferta::getMonto)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double tasaPromedio = ofertasCliente.stream()
                    .map(Oferta::getTasa)
                    .filter(Objects::nonNull)
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0.0);

            montoTotalGeneral = montoTotalGeneral.add(montoTotal);
            ofertasActivasGeneral += ofertasActivas;

            sb.append(String.format("%s,%s,%s,%s,%d,%s,%.2f\n",
                    escaparCsv(buildNombreCliente(c)),
                    escaparCsv(c.getNumeroDocumento()),
                    escaparCsv(c.getSegmento() != null ? c.getSegmento().getNombre() : ""),
                    escaparCsv(c.getZona() != null ? c.getZona().getNombre() : ""),
                    ofertasActivas,
                    montoTotal,
                    tasaPromedio));
        }

        sb.append("\n");
        sb.append(",,,TOTALES,").append(ofertasActivasGeneral).append(",").append(montoTotalGeneral).append(",\n");

        return new ByteArrayInputStream(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    private InputStream generarReporteDashboard(Map<String, String> filtros) {
        DashboardFiltroRequest dashboardFiltros = DashboardFiltroRequest.builder()
                .fechaDesde(parseFecha(filtros.get("fechaDesde")))
                .fechaHasta(parseFecha(filtros.get("fechaHasta")))
                .estadoCampania(filtros.get("estadoCampania"))
                .productoId(parseLong(filtros.get("productoId")))
                .periodoId(parseLong(filtros.get("periodoId")))
                .segmentoId(parseLong(filtros.get("segmentoId")))
                .build();

        DashboardResponse data = dashboardService.obtenerDashboard(dashboardFiltros);

        StringBuilder sb = new StringBuilder();
        sb.append("Resumen Ejecutivo\n\n");
        sb.append("Indicador,Valor\n");
        sb.append(String.format("Cantidad de Campañas,%d\n", data.getKpis().getTotalCampanias()));
        sb.append(String.format("Cantidad de Clientes,%d\n", data.getKpis().getTotalClientes()));
        sb.append(String.format("Cantidad de Ofertas,%d\n", data.getKpis().getTotalOfertas()));
        sb.append(String.format("Monto Total Ofertado,%.2f\n", data.getKpis().getMontoTotalOfertado()));
        sb.append(String.format("Ticket Promedio,%.2f\n", data.getKpis().getTicketPromedio()));
        sb.append("\n");

        sb.append("Campañas por Producto\n");
        sb.append("Producto,Cantidad\n");
        data.getCampaniasPorProducto().forEach(s ->
                sb.append(String.format("%s,%.0f\n", escaparCsv(s.getLabel()), s.getValor())));
        sb.append("\n");

        sb.append("Evolución de Monto Ofertado\n");
        sb.append("Mes,Monto\n");
        data.getEvolucionMonto().forEach(s ->
                sb.append(String.format("%s,%.2f\n", escaparCsv(s.getLabel()), s.getValor())));
        sb.append("\n");

        sb.append("Ticket Promedio por Segmento\n");
        sb.append("Segmento,Ticket Promedio\n");
        data.getTicketPromedioPorSegmento().forEach(s ->
                sb.append(String.format("%s,%.2f\n", escaparCsv(s.getLabel()), s.getValor())));

        return new ByteArrayInputStream(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    private boolean filtroLong(String filtro, Long valor) {
        if (!StringUtils.hasText(filtro)) return true;
        Long parsed = parseLong(filtro);
        return parsed != null && parsed.equals(valor);
    }

    private boolean filtroString(String filtro, String valor) {
        if (!StringUtils.hasText(filtro)) return true;
        return filtro.equalsIgnoreCase(valor);
    }

    private Long parseLong(String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseFecha(String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    private String buildNombreCliente(Cliente cliente) {
        StringBuilder sb = new StringBuilder();
        if (cliente.getPrimerNombre() != null) sb.append(cliente.getPrimerNombre());
        if (cliente.getSegundoNombre() != null) sb.append(" ").append(cliente.getSegundoNombre());
        if (cliente.getApellidoPaterno() != null) sb.append(" ").append(cliente.getApellidoPaterno());
        if (cliente.getApellidoMaterno() != null) sb.append(" ").append(cliente.getApellidoMaterno());
        return sb.toString().trim();
    }

    private String escaparCsv(String valor) {
        if (valor == null) return "";
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }
}

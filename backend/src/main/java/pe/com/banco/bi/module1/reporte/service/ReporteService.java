package pe.com.banco.bi.module1.reporte.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;
import pe.com.banco.bi.module1.reporte.dto.ReporteFiltroRequest;
import pe.com.banco.bi.module1.reporte.dto.ReporteResponse;
import pe.com.banco.bi.module1.reporte.enums.ReporteCatalogo;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
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

    public List<ReporteResponse> listarReportes() {
        return Arrays.stream(ReporteCatalogo.values())
                .map(r -> ReporteResponse.builder()
                        .id(r.getId())
                        .nombre(r.getNombre())
                        .descripcion(r.getDescripcion())
                        .filtros(r.getFiltros())
                        .formato("csv")
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public InputStream generarReporte(String reporteId, ReporteFiltroRequest request) {
        ReporteCatalogo reporte = ReporteCatalogo.buscarPorId(reporteId)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado: " + reporteId));

        return switch (reporte) {
            case CAMPANIAS -> generarReporteCampanias(request.getFiltros());
            case OFERTAS -> generarReporteOfertas(request.getFiltros());
            case CLIENTES -> generarReporteClientes(request.getFiltros());
        };
    }

    private InputStream generarReporteCampanias(Map<String, String> filtros) {
        // TODO: extender a PDF usando JasperReports/OpenPDF.
        // Para PDF, crear una plantilla .jrxml (JasperReports) o construir el documento
        // con OpenPDF, incluyendo logo, titulo, filtros aplicados, tabla de datos y totales.

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
        sb.append(",,,,,TOTALES,,");
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
        // TODO: extender a PDF usando JasperReports/OpenPDF.
        // Para PDF, crear una plantilla .jrxml (JasperReports) o construir el documento
        // con OpenPDF, incluyendo logo, titulo, filtros aplicados, tabla de datos y totales.

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
        // TODO: extender a PDF usando JasperReports/OpenPDF.
        // Para PDF, crear una plantilla .jrxml (JasperReports) o construir el documento
        // con OpenPDF, incluyendo logo, titulo, filtros aplicados, tabla de datos y totales.

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

package pe.com.banco.bi.module1.reporte.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Getter
public enum ReporteCatalogo {

    CAMPANIAS("campanias", "Reporte de Campañas", "Listado de campañas con agregaciones de clientes y montos", List.of("periodoId", "productoId", "estado")),
    OFERTAS("ofertas", "Reporte de Ofertas", "Listado de ofertas con montos, tasas y agregaciones", List.of("campaniaId", "clienteId", "estado", "fechaDesde", "fechaHasta")),
    CLIENTES("clientes", "Reporte de Clientes", "Listado de clientes con ofertas y montos asociados", List.of("segmentoId", "zonaId", "agenciaId", "periodoId"));

    private final String id;
    private final String nombre;
    private final String descripcion;
    private final List<String> filtros;

    ReporteCatalogo(String id, String nombre, String descripcion, List<String> filtros) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.filtros = filtros;
    }

    public static Optional<ReporteCatalogo> buscarPorId(String id) {
        return Arrays.stream(values())
                .filter(r -> r.id.equalsIgnoreCase(id))
                .findFirst();
    }
}

package pe.com.banco.bi.module1.reporte.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteResponse {

    private String id;
    private String nombre;
    private String descripcion;
    private List<String> filtros;
    private String formato;
}

package pe.com.banco.bi.module1.reporte.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteFiltroResponse {

    private String codigo;
    private String nombre;
    private String tipo;
    private String catalogoEndpoint;
    private Integer orden;
}

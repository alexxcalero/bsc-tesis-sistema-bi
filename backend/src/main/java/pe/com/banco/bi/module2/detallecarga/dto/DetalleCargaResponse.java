package pe.com.banco.bi.module2.detallecarga.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCargaResponse {

    private Long id;
    private Integer numeroFila;
    private String datosFila;
    private Boolean esValido;
    private String observaciones;
}

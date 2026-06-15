package pe.com.banco.bi.module2.errorcarga.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorCargaResponse {

    private Long id;
    private Integer numeroFila;
    private String campo;
    private String mensajeError;
    private String tipoError;
}

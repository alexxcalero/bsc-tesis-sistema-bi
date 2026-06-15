package pe.com.banco.bi.module2.resultadocarga.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoCargaResponse {

    private Long id;
    private Integer totalRegistros;
    private Integer totalRegistrosValidos;
    private Integer totalRegistrosInvalidos;
    private Integer totalRegistrosProcesados;
}

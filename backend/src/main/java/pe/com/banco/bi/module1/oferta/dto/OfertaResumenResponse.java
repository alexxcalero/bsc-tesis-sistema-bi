package pe.com.banco.bi.module1.oferta.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfertaResumenResponse {

    private long totalOfertas;
    private long clientesAlcanzados;
    private BigDecimal montoTotalOfertado;
    private BigDecimal ticketPromedio;
}

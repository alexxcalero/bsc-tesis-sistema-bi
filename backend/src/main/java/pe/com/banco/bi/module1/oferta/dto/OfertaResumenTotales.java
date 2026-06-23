package pe.com.banco.bi.module1.oferta.dto;

import java.math.BigDecimal;

public record OfertaResumenTotales(
        Long totalOfertas,
        Long clientesAlcanzados,
        BigDecimal montoTotalOfertado
) {
}

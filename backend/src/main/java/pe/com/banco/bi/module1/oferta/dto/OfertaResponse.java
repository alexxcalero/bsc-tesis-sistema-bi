package pe.com.banco.bi.module1.oferta.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfertaResponse {

    private Long id;
    private BigDecimal monto;
    private BigDecimal tasa;
    private LocalDate fechaOferta;
    private String estado;
    private String observacion;
    private Long campaniaId;
    private String campaniaNombre;
    private Long clienteId;
    private String clienteNombreCompleto;
}

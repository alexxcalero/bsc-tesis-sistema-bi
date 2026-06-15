package pe.com.banco.bi.module1.campania.dto;

import lombok.*;
import pe.com.banco.bi.catalog.dto.CatalogoResponse;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaniaResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private String estado;
    private CatalogoResponse periodo;
    private CatalogoResponse producto;
    private CatalogoResponse subproducto;
    private Integer clientesAlcanzados;
    private BigDecimal montoOfertado;
    private BigDecimal ticketPromedio;
}

package pe.com.banco.bi.module1.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardKpiResponse {

    private Long totalCampanias;
    private Long totalClientes;
    private Long totalOfertas;
    private Double montoTotalOfertado;
    private Double ticketPromedio;
    private Double tasaConversion;
}

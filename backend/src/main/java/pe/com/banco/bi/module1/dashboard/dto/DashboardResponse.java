package pe.com.banco.bi.module1.dashboard.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private DashboardKpiResponse kpis;
    private List<SerieData> campaniasPorProducto;
    private List<SerieData> evolucionMonto;
    private List<SerieData> ticketPromedioPorSegmento;
}

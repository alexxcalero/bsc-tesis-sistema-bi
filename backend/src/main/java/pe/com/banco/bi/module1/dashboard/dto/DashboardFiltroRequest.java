package pe.com.banco.bi.module1.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFiltroRequest {

    private LocalDate fechaDesde;
    private LocalDate fechaHasta;
    private String estadoCampania;
    private Long productoId;
    private List<Long> periodoIds;
    private Long segmentoId;

    public void setPeriodoId(Long periodoId) {
        if (periodoId != null) {
            this.periodoIds = List.of(periodoId);
        }
    }

    public boolean tieneAlgunFiltro() {
        return fechaDesde != null
                || fechaHasta != null
                || (estadoCampania != null && !estadoCampania.isBlank())
                || productoId != null
                || (periodoIds != null && !periodoIds.isEmpty())
                || segmentoId != null;
    }
}

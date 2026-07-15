package pe.com.banco.bi.module1.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

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
    private Long periodoId;
    private Long segmentoId;

    public boolean tieneAlgunFiltro() {
        return fechaDesde != null
                || fechaHasta != null
                || (estadoCampania != null && !estadoCampania.isBlank())
                || productoId != null
                || periodoId != null
                || segmentoId != null;
    }
}

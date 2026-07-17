package pe.com.banco.bi.module1.campania.service;

import org.springframework.stereotype.Component;
import pe.com.banco.bi.module1.campania.entity.Campania;

import java.time.LocalDate;

@Component
public class CampaniaEstadoCalculator {

    public String calcularEstado(Campania campania) {
        LocalDate hoy = LocalDate.now();
        LocalDate fechaInicio = campania.getFechaInicio();
        LocalDate fechaFin = campania.getFechaFin();

        if (fechaInicio == null || fechaFin == null) {
            return "INACTIVA";
        }

        if (!hoy.isBefore(fechaInicio) && !hoy.isAfter(fechaFin)) {
            return "ACTIVA";
        }

        return "INACTIVA";
    }

    public void aplicarEstadoCalculado(Campania campania) {
        campania.setEstado(calcularEstado(campania));
    }
}

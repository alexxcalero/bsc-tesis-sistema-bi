package pe.com.banco.bi.module2.procesocarga.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcesoCargaResumenResponse {

    private Long total;
    private Long pendientes;
    private Long enValidacion;
    private Long validadas;
    private Long conErrores;
    private Long publicadas;
    private Long rechazadas;
    private Long totalRegistros;
    private Long totalRegValidos;
    private Long totalRegInvalidos;
}

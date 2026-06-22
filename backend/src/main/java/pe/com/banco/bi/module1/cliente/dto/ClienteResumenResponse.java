package pe.com.banco.bi.module1.cliente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResumenResponse {

    private Long total;
    private Long personasNaturales;
    private Long personasJuridicas;
}

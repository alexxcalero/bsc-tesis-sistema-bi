package pe.com.banco.bi.module2.procesocarga.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcesoCargaRequest {

    @NotNull
    private Long tipoCargaId;

    private String periodo;

    private String nombreCarga;

    private String observacion;
}

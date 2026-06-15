package pe.com.banco.bi.securitydomain.permiso.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
}

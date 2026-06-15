package pe.com.banco.bi.securitydomain.rol.dto;

import lombok.*;
import pe.com.banco.bi.securitydomain.permiso.dto.PermisoResponse;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Set<PermisoResponse> permisos;
}

package pe.com.banco.bi.securitydomain.usuario.dto;

import lombok.*;
import pe.com.banco.bi.securitydomain.rol.dto.RolResponse;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioResponse {

    private Long id;
    private String username;
    private String primerNombre;
    private String segundoNombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String correo;
    private Boolean estado;
    private String nombreCompleto;
    private RolResponse rol;
}

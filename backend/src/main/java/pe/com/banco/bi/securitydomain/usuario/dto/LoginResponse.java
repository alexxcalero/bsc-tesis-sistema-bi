package pe.com.banco.bi.securitydomain.usuario.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String type;
    private Long expiresIn;
    private UsuarioResponse usuario;
}

package pe.com.banco.bi.securitydomain.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioUpdateRequest {

    @NotBlank
    @Size(max = 50)
    private String username;

    @NotBlank
    @Size(max = 100)
    private String primerNombre;

    @Size(max = 100)
    private String segundoNombre;

    @NotBlank
    @Size(max = 100)
    private String apellidoPaterno;

    @Size(max = 100)
    private String apellidoMaterno;

    @NotBlank
    @Email
    @Size(max = 150)
    private String correo;

    @NotNull
    private Long rolId;
}

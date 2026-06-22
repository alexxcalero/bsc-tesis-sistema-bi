package pe.com.banco.bi.securitydomain.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioChangePasswordRequest {

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;
}

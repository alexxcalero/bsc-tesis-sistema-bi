package pe.com.banco.bi.securitydomain.usuario.service;

import pe.com.banco.bi.securitydomain.usuario.dto.LoginRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.LoginResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    UsuarioResponse me(String username);
}

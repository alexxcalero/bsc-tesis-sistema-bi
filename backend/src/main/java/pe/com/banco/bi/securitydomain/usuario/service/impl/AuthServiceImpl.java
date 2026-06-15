package pe.com.banco.bi.securitydomain.usuario.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.security.JwtUtil;
import pe.com.banco.bi.securitydomain.usuario.dto.LoginRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.LoginResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;
import pe.com.banco.bi.securitydomain.usuario.mapper.UsuarioMapper;
import pe.com.banco.bi.securitydomain.usuario.repository.UsuarioRepository;
import pe.com.banco.bi.securitydomain.usuario.service.AuthService;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioMapper usuarioMapper;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Usuario usuario = userDetails.getUsuario();

        String token = jwtUtil.generateToken(
                usuario.getUsername(),
                usuario.getId(),
                usuario.getRol().getCodigo()
        );

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .usuario(usuarioMapper.toResponse(usuario))
                .build();
    }

    @Override
    public UsuarioResponse me(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuarioMapper.toResponse(usuario);
    }
}

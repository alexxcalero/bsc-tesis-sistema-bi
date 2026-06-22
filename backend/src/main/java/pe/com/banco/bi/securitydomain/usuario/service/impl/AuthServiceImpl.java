package pe.com.banco.bi.securitydomain.usuario.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.security.JwtUtil;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaRegistroRequest;
import pe.com.banco.bi.securitydomain.auditoria.service.AuditoriaService;
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
    private final AuditoriaService auditoriaService;

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            Usuario usuario = userDetails.getUsuario();

            registrarAuditoriaLogin("LOGIN_EXITOSO", usuario.getId(), usuario.getUsername(), usuario.getRol().getCodigo(), null);

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
        } catch (BadCredentialsException e) {
            registrarAuditoriaLogin("LOGIN_FALLIDO", null, request.getUsername(), "DESCONOCIDO",
                    "Credenciales incorrectas");
            throw new BadCredentialsException("Credenciales incorrectas");
        }
    }

    @Override
    public UsuarioResponse me(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return usuarioMapper.toResponse(usuario);
    }

    private void registrarAuditoriaLogin(String accion, Long usuarioId, String username, String rol, String detalle) {
        HttpServletRequest request = getCurrentRequest();
        AuditoriaRegistroRequest registro = AuditoriaRegistroRequest.builder()
                .accion(accion)
                .entidad("SESION")
                .entidadId(username)
                .detalle(detalle)
                .usuarioId(usuarioId)
                .username(username)
                .rol(rol)
                .ipAddress(obtenerIp(request))
                .userAgent(request != null ? request.getHeader("User-Agent") : null)
                .build();
        auditoriaService.registrar(registro);
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String obtenerIp(HttpServletRequest request) {
        if (request == null) return null;
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

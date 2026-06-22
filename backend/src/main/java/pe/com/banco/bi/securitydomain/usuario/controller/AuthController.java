package pe.com.banco.bi.securitydomain.usuario.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaRegistroRequest;
import pe.com.banco.bi.securitydomain.auditoria.service.AuditoriaService;
import pe.com.banco.bi.securitydomain.usuario.dto.LoginRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.LoginResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuditoriaService auditoriaService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(authService.me(userDetails.getUsername()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal CustomUserDetails userDetails,
                                       HttpServletRequest request) {
        if (userDetails != null) {
            UsuarioResponse usuario = authService.me(userDetails.getUsername());
            AuditoriaRegistroRequest registro = AuditoriaRegistroRequest.builder()
                    .accion("LOGOUT")
                    .entidad("SESION")
                    .entidadId(usuario.getUsername())
                    .usuarioId(usuario.getId())
                    .username(usuario.getUsername())
                    .rol(usuario.getRol().getCodigo())
                    .ipAddress(obtenerIp(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();
            auditoriaService.registrar(registro);
        }
        return ResponseEntity.ok().build();
    }

    private String obtenerIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

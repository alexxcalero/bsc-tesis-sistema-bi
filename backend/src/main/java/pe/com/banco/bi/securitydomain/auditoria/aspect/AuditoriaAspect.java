package pe.com.banco.bi.securitydomain.auditoria.aspect;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaRegistroRequest;
import pe.com.banco.bi.securitydomain.auditoria.service.AuditoriaService;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditoriaAspect {

    private final AuditoriaService auditoriaService;

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void restControllerMethods() {
    }

    @Pointcut("!within(pe.com.banco.bi.securitydomain.auditoria..*)")
    public void excludeAuditoria() {
    }

    @Pointcut("!within(pe.com.banco.bi.securitydomain.usuario.controller.AuthController)")
    public void excludeAuth() {
    }

    @AfterReturning("restControllerMethods() && excludeAuditoria() && excludeAuth()")
    public void auditar(JoinPoint joinPoint) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            Class<?> controllerClass = method.getDeclaringClass();

            HttpServletRequest request = getCurrentRequest();
            if (request == null) return;

            String httpMethod = request.getMethod();
            String requestUri = request.getRequestURI();

            String accion = determinarAccion(httpMethod, requestUri);
            String entidad = determinarEntidad(controllerClass);
            String entidadId = extraerEntidadId(method, joinPoint.getArgs());
            String detalle = construirDetalle(request, method, joinPoint.getArgs());

            UsuarioInfo usuario = obtenerUsuarioInfo();

            AuditoriaRegistroRequest registro = AuditoriaRegistroRequest.builder()
                    .accion(accion)
                    .entidad(entidad)
                    .entidadId(entidadId)
                    .detalle(detalle)
                    .usuarioId(usuario.id())
                    .username(usuario.username())
                    .rol(usuario.rol())
                    .ipAddress(obtenerIp(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .build();

            auditoriaService.registrar(registro);
        } catch (Exception e) {
            // No debe afectar la operación principal
        }
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String determinarAccion(String httpMethod, String requestUri) {
        String uri = requestUri.toLowerCase();
        if (uri.contains("/publicar")) return "PUBLICAR";
        if (uri.contains("/validar")) return "VALIDAR";
        if (uri.contains("/recalcular")) return "RECALCULAR";

        return switch (httpMethod.toUpperCase()) {
            case "GET" -> "CONSULTAR";
            case "POST" -> "CREAR";
            case "PUT", "PATCH" -> "ACTUALIZAR";
            case "DELETE" -> "ELIMINAR";
            default -> httpMethod.toUpperCase();
        };
    }

    private String determinarEntidad(Class<?> controllerClass) {
        String name = controllerClass.getSimpleName().replace("Controller", "").toUpperCase();
        return switch (name) {
            case "CLIENTE" -> "CLIENTE";
            case "CAMPANIA" -> "CAMPANIA";
            case "OFERTA" -> "OFERTA";
            case "PROCESOCARGA", "CARGA" -> "CARGA";
            case "REPORTE" -> "REPORTE";
            case "DASHBOARD" -> "DASHBOARD";
            case "CATALOGO" -> "CATALOGO";
            case "USUARIO" -> "USUARIO";
            case "AUDITORIA" -> "AUDITORIA";
            default -> name;
        };
    }

    private String extraerEntidadId(Method method, Object[] args) {
        Annotation[][] annotations = method.getParameterAnnotations();
        for (int i = 0; i < annotations.length; i++) {
            for (Annotation annotation : annotations[i]) {
                if (annotation instanceof PathVariable) {
                    Object value = args[i];
                    return value != null ? value.toString() : null;
                }
            }
        }
        return null;
    }

    private String construirDetalle(HttpServletRequest request, Method method, Object[] args) {
        Map<String, Object> detalle = new HashMap<>();
        detalle.put("uri", request.getRequestURI());
        detalle.put("method", request.getMethod());

        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((k, v) -> {
            if (!k.equalsIgnoreCase("password")) {
                params.put(k, String.join(",", v));
            }
        });
        if (!params.isEmpty()) {
            detalle.put("queryParams", params);
        }

        // Capturar body de POST/PUT no es trivial con stream; se omite por seguridad/simplicidad
        return detalle.toString();
    }

    private UsuarioInfo obtenerUsuarioInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return new UsuarioInfo(null, "ANONIMO", "ANONIMO");
        }
        if (auth.getPrincipal() instanceof CustomUserDetails details) {
            return new UsuarioInfo(
                    details.getUsuario().getId(),
                    details.getUsername(),
                    details.getUsuario().getRol().getCodigo()
            );
        }
        return new UsuarioInfo(null, auth.getName(), "DESCONOCIDO");
    }

    private String obtenerIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank()) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record UsuarioInfo(Long id, String username, String rol) {
    }
}

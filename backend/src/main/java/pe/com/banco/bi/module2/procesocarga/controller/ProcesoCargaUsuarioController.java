package pe.com.banco.bi.module2.procesocarga.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.module2.procesocarga.dto.UsuarioResponsableResponse;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cargas/usuarios-responsables")
@RequiredArgsConstructor
public class ProcesoCargaUsuarioController {

    private final ProcesoCargaRepository procesoCargaRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<List<UsuarioResponsableResponse>> listar() {
        List<Usuario> usuarios = procesoCargaRepository.findUsuariosResponsables();
        List<UsuarioResponsableResponse> response = usuarios.stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    private UsuarioResponsableResponse toResponse(Usuario usuario) {
        return UsuarioResponsableResponse.builder()
                .id(usuario.getId())
                .nombreCompleto(buildNombreCompleto(usuario))
                .build();
    }

    private String buildNombreCompleto(Usuario usuario) {
        StringBuilder sb = new StringBuilder();
        if (usuario.getPrimerNombre() != null) sb.append(usuario.getPrimerNombre());
        if (usuario.getSegundoNombre() != null) sb.append(" ").append(usuario.getSegundoNombre());
        if (usuario.getApellidoPaterno() != null) sb.append(" ").append(usuario.getApellidoPaterno());
        if (usuario.getApellidoMaterno() != null) sb.append(" ").append(usuario.getApellidoMaterno());
        return sb.toString().trim();
    }
}

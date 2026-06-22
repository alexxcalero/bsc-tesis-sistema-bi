package pe.com.banco.bi.securitydomain.usuario.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioChangePasswordRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioCreateRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioUpdateRequest;
import pe.com.banco.bi.securitydomain.usuario.service.UsuarioService;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAuthority('USUARIOS_VER')")
    public ResponseEntity<Page<UsuarioResponse>> listar(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long rolId,
            Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listarUsuarios(username, nombre, rolId, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USUARIOS_VER')")
    public ResponseEntity<UsuarioResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerUsuario(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USUARIOS_CREAR')")
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody UsuarioCreateRequest request) {
        return ResponseEntity.ok(usuarioService.crearUsuario(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USUARIOS_EDITAR')")
    public ResponseEntity<UsuarioResponse> actualizar(@PathVariable Long id,
                                                      @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuario(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('USUARIOS_EDITAR')")
    public ResponseEntity<UsuarioResponse> cambiarEstado(@PathVariable Long id,
                                                         @RequestParam Boolean estado) {
        return ResponseEntity.ok(usuarioService.cambiarEstado(id, estado));
    }

    @PatchMapping("/{id}/password")
    @PreAuthorize("hasAuthority('USUARIOS_EDITAR')")
    public ResponseEntity<UsuarioResponse> cambiarPassword(@PathVariable Long id,
                                                           @Valid @RequestBody UsuarioChangePasswordRequest request) {
        return ResponseEntity.ok(usuarioService.cambiarPassword(id, request));
    }
}

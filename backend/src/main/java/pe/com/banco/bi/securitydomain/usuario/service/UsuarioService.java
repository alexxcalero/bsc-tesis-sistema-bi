package pe.com.banco.bi.securitydomain.usuario.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioChangePasswordRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioCreateRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioUpdateRequest;

public interface UsuarioService {

    Page<UsuarioResponse> listarUsuarios(String username, String nombre, Long rolId, Pageable pageable);

    UsuarioResponse obtenerUsuario(Long id);

    UsuarioResponse crearUsuario(UsuarioCreateRequest request);

    UsuarioResponse actualizarUsuario(Long id, UsuarioUpdateRequest request);

    UsuarioResponse cambiarEstado(Long id, Boolean estado);

    UsuarioResponse cambiarPassword(Long id, UsuarioChangePasswordRequest request);
}

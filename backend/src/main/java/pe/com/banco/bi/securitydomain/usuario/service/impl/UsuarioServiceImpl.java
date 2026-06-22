package pe.com.banco.bi.securitydomain.usuario.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.securitydomain.rol.entity.Rol;
import pe.com.banco.bi.securitydomain.rol.repository.RolRepository;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioChangePasswordRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioCreateRequest;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioUpdateRequest;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;
import pe.com.banco.bi.securitydomain.usuario.mapper.UsuarioMapper;
import pe.com.banco.bi.securitydomain.usuario.repository.UsuarioRepository;
import pe.com.banco.bi.securitydomain.usuario.service.UsuarioService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<UsuarioResponse> listarUsuarios(String username, String nombre, Long rolId, Pageable pageable) {
        return usuarioRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (username != null && !username.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() + "%"));
            }
            if (nombre != null && !nombre.isBlank()) {
                Predicate p1 = cb.like(cb.lower(root.get("primerNombre")), "%" + nombre.toLowerCase() + "%");
                Predicate p2 = cb.like(cb.lower(root.get("apellidoPaterno")), "%" + nombre.toLowerCase() + "%");
                predicates.add(cb.or(p1, p2));
            }
            if (rolId != null) {
                predicates.add(cb.equal(root.get("rol").get("id"), rolId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable).map(usuarioMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuario(Long id) {
        Usuario usuario = findById(id);
        return usuarioMapper.toResponse(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponse crearUsuario(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }
        if (usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está en uso");
        }

        Rol rol = findRolById(request.getRolId());

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .primerNombre(request.getPrimerNombre())
                .segundoNombre(request.getSegundoNombre())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .correo(request.getCorreo())
                .estado(true)
                .rol(rol)
                .build();

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse actualizarUsuario(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = findById(id);

        if (!usuario.getUsername().equalsIgnoreCase(request.getUsername()) && usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El username ya está en uso");
        }
        if (!usuario.getCorreo().equalsIgnoreCase(request.getCorreo()) && usuarioRepository.existsByCorreo(request.getCorreo())) {
            throw new RuntimeException("El correo ya está en uso");
        }

        Rol rol = findRolById(request.getRolId());

        usuario.setUsername(request.getUsername());
        usuario.setPrimerNombre(request.getPrimerNombre());
        usuario.setSegundoNombre(request.getSegundoNombre());
        usuario.setApellidoPaterno(request.getApellidoPaterno());
        usuario.setApellidoMaterno(request.getApellidoMaterno());
        usuario.setCorreo(request.getCorreo());
        usuario.setRol(rol);

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse cambiarEstado(Long id, Boolean estado) {
        Usuario usuario = findById(id);
        usuario.setEstado(estado);
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponse cambiarPassword(Long id, UsuarioChangePasswordRequest request) {
        Usuario usuario = findById(id);
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    private Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    private Rol findRolById(Long id) {
        return rolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));
    }
}

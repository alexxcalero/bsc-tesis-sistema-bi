package pe.com.banco.bi.securitydomain.usuario.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.com.banco.bi.securitydomain.rol.mapper.RolMapper;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

@Mapper(componentModel = "spring", uses = RolMapper.class)
public interface UsuarioMapper {

    @Mapping(target = "nombreCompleto", expression = "java(buildNombreCompleto(usuario))")
    UsuarioResponse toResponse(Usuario usuario);

    default String buildNombreCompleto(Usuario usuario) {
        StringBuilder sb = new StringBuilder();
        if (usuario.getPrimerNombre() != null) sb.append(usuario.getPrimerNombre());
        if (usuario.getSegundoNombre() != null) sb.append(" ").append(usuario.getSegundoNombre());
        if (usuario.getApellidoPaterno() != null) sb.append(" ").append(usuario.getApellidoPaterno());
        if (usuario.getApellidoMaterno() != null) sb.append(" ").append(usuario.getApellidoMaterno());
        return sb.toString().trim();
    }
}

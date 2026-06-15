package pe.com.banco.bi.securitydomain.rol.mapper;

import org.mapstruct.Mapper;
import pe.com.banco.bi.securitydomain.permiso.mapper.PermisoMapper;
import pe.com.banco.bi.securitydomain.rol.dto.RolResponse;
import pe.com.banco.bi.securitydomain.rol.entity.Rol;

@Mapper(componentModel = "spring", uses = PermisoMapper.class)
public interface RolMapper {

    RolResponse toResponse(Rol rol);
}

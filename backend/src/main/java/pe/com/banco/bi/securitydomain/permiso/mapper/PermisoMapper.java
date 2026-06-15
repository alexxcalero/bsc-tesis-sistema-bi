package pe.com.banco.bi.securitydomain.permiso.mapper;

import org.mapstruct.Mapper;
import pe.com.banco.bi.securitydomain.permiso.dto.PermisoResponse;
import pe.com.banco.bi.securitydomain.permiso.entity.Permiso;

@Mapper(componentModel = "spring")
public interface PermisoMapper {

    PermisoResponse toResponse(Permiso permiso);
}

package pe.com.banco.bi.securitydomain.auditoria.mapper;

import org.mapstruct.Mapper;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaResponse;
import pe.com.banco.bi.securitydomain.auditoria.entity.Auditoria;

@Mapper(componentModel = "spring")
public interface AuditoriaMapper {

    AuditoriaResponse toResponse(Auditoria auditoria);
}

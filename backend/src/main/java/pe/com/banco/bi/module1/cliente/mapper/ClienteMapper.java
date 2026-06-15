package pe.com.banco.bi.module1.cliente.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.com.banco.bi.catalog.mapper.CatalogoMapper;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.cliente.entity.Cliente;

@Mapper(componentModel = "spring", uses = CatalogoMapper.class)
public interface ClienteMapper {

    @Mapping(target = "nombreCompleto", expression = "java(buildNombreCompleto(cliente))")
    ClienteResponse toResponse(Cliente cliente);

    default String buildNombreCompleto(Cliente cliente) {
        StringBuilder sb = new StringBuilder();
        if (cliente.getPrimerNombre() != null) sb.append(cliente.getPrimerNombre());
        if (cliente.getSegundoNombre() != null) sb.append(" ").append(cliente.getSegundoNombre());
        if (cliente.getApellidoPaterno() != null) sb.append(" ").append(cliente.getApellidoPaterno());
        if (cliente.getApellidoMaterno() != null) sb.append(" ").append(cliente.getApellidoMaterno());
        return sb.toString().trim();
    }
}

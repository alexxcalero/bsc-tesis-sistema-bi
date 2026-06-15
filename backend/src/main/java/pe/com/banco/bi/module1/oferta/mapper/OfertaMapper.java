package pe.com.banco.bi.module1.oferta.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;
import pe.com.banco.bi.module1.oferta.entity.Oferta;

@Mapper(componentModel = "spring")
public interface OfertaMapper {

    @Mapping(target = "campaniaId", source = "campania.id")
    @Mapping(target = "campaniaNombre", source = "campania.nombre")
    @Mapping(target = "clienteId", source = "cliente.id")
    @Mapping(target = "clienteNombreCompleto", expression = "java(buildClienteNombre(oferta))")
    OfertaResponse toResponse(Oferta oferta);

    default String buildClienteNombre(Oferta oferta) {
        var c = oferta.getCliente();
        StringBuilder sb = new StringBuilder();
        if (c.getPrimerNombre() != null) sb.append(c.getPrimerNombre());
        if (c.getSegundoNombre() != null) sb.append(" ").append(c.getSegundoNombre());
        if (c.getApellidoPaterno() != null) sb.append(" ").append(c.getApellidoPaterno());
        if (c.getApellidoMaterno() != null) sb.append(" ").append(c.getApellidoMaterno());
        return sb.toString().trim();
    }
}

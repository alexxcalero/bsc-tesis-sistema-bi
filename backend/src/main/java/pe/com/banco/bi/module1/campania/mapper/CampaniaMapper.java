package pe.com.banco.bi.module1.campania.mapper;

import org.mapstruct.Mapper;
import pe.com.banco.bi.catalog.mapper.CatalogoMapper;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.entity.Campania;

@Mapper(componentModel = "spring", uses = CatalogoMapper.class)
public interface CampaniaMapper {

    CampaniaResponse toResponse(Campania campania);
}

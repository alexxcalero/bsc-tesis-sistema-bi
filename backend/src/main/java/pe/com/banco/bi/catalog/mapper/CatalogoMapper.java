package pe.com.banco.bi.catalog.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.com.banco.bi.catalog.dto.*;
import pe.com.banco.bi.catalog.entity.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CatalogoMapper {

    CatalogoResponse toResponse(TipoCliente entity);
    CatalogoResponse toResponse(TipoDocumento entity);
    CatalogoResponse toResponse(Segmento entity);
    CatalogoResponse toResponse(Zona entity);
    CatalogoResponse toResponse(Canal entity);
    CatalogoResponse toResponse(Producto entity);
    CatalogoResponse toResponse(FiltroOferta entity);
    CatalogoResponse toResponse(Periodo entity);
    CatalogoResponse toResponse(TipoCarga entity);
    CatalogoResponse toResponse(EstadoCarga entity);

    @Mapping(target = "zona", source = "zona")
    AgenciaResponse toResponse(Agencia entity);

    @Mapping(target = "producto", source = "producto")
    SubproductoResponse toResponse(Subproducto entity);

    List<CatalogoResponse> toResponseList(List<TipoCliente> entities);

    default ProductoConSubproductosResponse toProductoConSubproductos(Producto producto, List<Subproducto> subproductos) {
        return ProductoConSubproductosResponse.builder()
                .id(producto.getId())
                .codigo(producto.getCodigo())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .activo(producto.getActivo())
                .subproductos(subproductos.stream().map(this::toResponse).toList())
                .build();
    }
}

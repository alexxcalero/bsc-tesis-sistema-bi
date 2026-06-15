package pe.com.banco.bi.module2.procesocarga.mapper;

import org.mapstruct.Mapper;
import pe.com.banco.bi.catalog.mapper.CatalogoMapper;
import pe.com.banco.bi.module2.archivocarga.dto.ArchivoCargaResponse;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResponse;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.resultadocarga.dto.ResultadoCargaResponse;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;
import pe.com.banco.bi.securitydomain.usuario.mapper.UsuarioMapper;

@Mapper(componentModel = "spring", uses = {CatalogoMapper.class, UsuarioMapper.class})
public interface ProcesoCargaMapper {

    ProcesoCargaResponse toResponse(ProcesoCarga procesoCarga);

    default ArchivoCargaResponse toArchivoResponse(ArchivoCarga archivo) {
        if (archivo == null) return null;
        return ArchivoCargaResponse.builder()
                .id(archivo.getId())
                .nombreArchivo(archivo.getNombreArchivo())
                .tipoArchivo(archivo.getTipoArchivo())
                .tamanoArchivo(archivo.getTamanoArchivo())
                .build();
    }

    default ResultadoCargaResponse toResultadoResponse(ResultadoCarga resultado) {
        if (resultado == null) return null;
        return ResultadoCargaResponse.builder()
                .id(resultado.getId())
                .totalRegistros(resultado.getTotalRegistros())
                .totalRegistrosValidos(resultado.getTotalRegistrosValidos())
                .totalRegistrosInvalidos(resultado.getTotalRegistrosInvalidos())
                .totalRegistrosProcesados(resultado.getTotalRegistrosProcesados())
                .build();
    }
}

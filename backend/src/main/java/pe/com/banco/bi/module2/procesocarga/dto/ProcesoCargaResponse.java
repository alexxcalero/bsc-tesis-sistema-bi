package pe.com.banco.bi.module2.procesocarga.dto;

import lombok.*;
import pe.com.banco.bi.catalog.dto.CatalogoResponse;
import pe.com.banco.bi.module2.archivocarga.dto.ArchivoCargaResponse;
import pe.com.banco.bi.module2.resultadocarga.dto.ResultadoCargaResponse;
import pe.com.banco.bi.securitydomain.usuario.dto.UsuarioResponse;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcesoCargaResponse {

    private Long id;
    private String codigo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String observacion;
    private Integer totalRegistros;
    private Integer totalRegValidos;
    private Integer totalRegInvalidos;
    private CatalogoResponse tipoCarga;
    private CatalogoResponse estadoCarga;
    private UsuarioResponse usuario;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ArchivoCargaResponse archivo;
    private ResultadoCargaResponse resultado;
}

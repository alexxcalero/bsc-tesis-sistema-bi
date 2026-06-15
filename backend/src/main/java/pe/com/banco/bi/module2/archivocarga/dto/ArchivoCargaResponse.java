package pe.com.banco.bi.module2.archivocarga.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoCargaResponse {

    private Long id;
    private String nombreArchivo;
    private String tipoArchivo;
    private Long tamanoArchivo;
}

package pe.com.banco.bi.catalog.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoResponse {

    private Long id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}

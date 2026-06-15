package pe.com.banco.bi.module1.cliente.dto;

import lombok.*;
import pe.com.banco.bi.catalog.dto.CatalogoResponse;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteResponse {

    private Long id;
    private String primerNombre;
    private String segundoNombre;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private CatalogoResponse tipoDocumento;
    private String numeroDocumento;
    private String correo;
    private String telefono;
    private String direccion;
    private LocalDate fechaNacimiento;
    private CatalogoResponse segmento;
    private CatalogoResponse zona;
    private CatalogoResponse agencia;
    private CatalogoResponse canal;
    private CatalogoResponse tipoCliente;
}

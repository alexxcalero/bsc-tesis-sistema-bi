package pe.com.banco.bi.securitydomain.auditoria.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaRegistroRequest {

    private String accion;
    private String entidad;
    private String entidadId;
    private String detalle;
    private Long usuarioId;
    private String username;
    private String rol;
    private String ipAddress;
    private String userAgent;
}

package pe.com.banco.bi.securitydomain.auditoria.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaResponse {

    private Long id;
    private Long usuarioId;
    private String username;
    private String rol;
    private String accion;
    private String entidad;
    private String entidadId;
    private String detalle;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime fechaHora;
}

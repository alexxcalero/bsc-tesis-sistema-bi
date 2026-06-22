package pe.com.banco.bi.securitydomain.auditoria.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaRegistroRequest;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaResponse;

import java.time.LocalDateTime;

public interface AuditoriaService {

    void registrar(AuditoriaRegistroRequest request);

    Page<AuditoriaResponse> listar(String username, String accion, String entidad,
                                   LocalDateTime fechaDesde, LocalDateTime fechaHasta, Pageable pageable);
}

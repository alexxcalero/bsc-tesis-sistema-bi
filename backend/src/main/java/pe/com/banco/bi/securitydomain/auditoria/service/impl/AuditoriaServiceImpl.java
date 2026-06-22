package pe.com.banco.bi.securitydomain.auditoria.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaRegistroRequest;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaResponse;
import pe.com.banco.bi.securitydomain.auditoria.entity.Auditoria;
import pe.com.banco.bi.securitydomain.auditoria.mapper.AuditoriaMapper;
import pe.com.banco.bi.securitydomain.auditoria.repository.AuditoriaRepository;
import pe.com.banco.bi.securitydomain.auditoria.service.AuditoriaService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditoriaServiceImpl implements AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final AuditoriaMapper auditoriaMapper;

    @Override
    @Async
    @Transactional
    public void registrar(AuditoriaRegistroRequest request) {
        Auditoria auditoria = Auditoria.builder()
                .usuarioId(request.getUsuarioId())
                .username(request.getUsername())
                .rol(request.getRol())
                .accion(request.getAccion())
                .entidad(request.getEntidad())
                .entidadId(request.getEntidadId())
                .detalle(request.getDetalle())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .build();
        auditoriaRepository.save(auditoria);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditoriaResponse> listar(String username, String accion, String entidad,
                                          LocalDateTime fechaDesde, LocalDateTime fechaHasta, Pageable pageable) {
        return auditoriaRepository.findAll((root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (username != null && !username.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() + "%"));
            }
            if (accion != null && !accion.isBlank()) {
                predicates.add(cb.equal(root.get("accion"), accion));
            }
            if (entidad != null && !entidad.isBlank()) {
                predicates.add(cb.equal(root.get("entidad"), entidad));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("fechaHora"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("fechaHora"), fechaHasta));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        }, pageable).map(auditoriaMapper::toResponse);
    }
}

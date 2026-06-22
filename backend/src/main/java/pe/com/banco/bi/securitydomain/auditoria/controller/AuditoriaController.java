package pe.com.banco.bi.securitydomain.auditoria.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.securitydomain.auditoria.dto.AuditoriaResponse;
import pe.com.banco.bi.securitydomain.auditoria.service.AuditoriaService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auditorias")
@RequiredArgsConstructor
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDITORIA_VER')")
    public ResponseEntity<Page<AuditoriaResponse>> listar(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String entidad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            Pageable pageable) {
        return ResponseEntity.ok(auditoriaService.listar(username, accion, entidad, fechaDesde, fechaHasta, pageable));
    }
}

package pe.com.banco.bi.module1.reporte.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import pe.com.banco.bi.module1.reporte.dto.ReporteFiltroRequest;
import pe.com.banco.bi.module1.reporte.dto.ReporteResponse;
import pe.com.banco.bi.module1.reporte.service.ReporteService;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping
    @PreAuthorize("hasAuthority('REPORTES_VER')")
    public ResponseEntity<List<ReporteResponse>> listar() {
        return ResponseEntity.ok(reporteService.listarReportes());
    }

    @PostMapping("/{id}/generar")
    @PreAuthorize("hasAuthority('REPORTES_CREAR')")
    public ResponseEntity<InputStreamResource> generar(
            @PathVariable String id,
            @RequestBody(required = false) ReporteFiltroRequest request) {

        if (request == null) {
            request = new ReporteFiltroRequest();
        }

        InputStream csv = reporteService.generarReporte(id, request);
        String filename = id + "_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(csv));
    }
}

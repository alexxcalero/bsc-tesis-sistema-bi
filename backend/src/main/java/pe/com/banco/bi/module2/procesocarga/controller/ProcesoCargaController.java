package pe.com.banco.bi.module2.procesocarga.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.module2.detallecarga.dto.DetalleCargaResponse;
import pe.com.banco.bi.module2.errorcarga.dto.ErrorCargaResponse;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaRequest;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResponse;
import pe.com.banco.bi.module2.procesocarga.service.ProcesoCargaService;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cargas")
@RequiredArgsConstructor
public class ProcesoCargaController {

    private final ProcesoCargaService procesoCargaService;

    @GetMapping
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<Page<ProcesoCargaResponse>> listar(
            @RequestParam(required = false) Long tipoCargaId,
            @RequestParam(required = false) String estados,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta,
            Pageable pageable) {
        List<String> estadosList = parseEstados(estados);
        return ResponseEntity.ok(procesoCargaService.listarCargas(tipoCargaId, estadosList, usuarioId, search, fechaDesde, fechaHasta, pageable));
    }

    private List<String> parseEstados(String estados) {
        if (estados == null || estados.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(estados.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAuthority('CARGAS_CREAR')")
    public ResponseEntity<ProcesoCargaResponse> registrar(
            @Valid @RequestPart("datos") ProcesoCargaRequest request,
            @RequestPart("archivo") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(procesoCargaService.registrarCarga(request, file, userDetails.getUsuario().getId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<ProcesoCargaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(procesoCargaService.obtenerCarga(id));
    }

    @PostMapping("/{id}/validar")
    @PreAuthorize("hasAuthority('CARGAS_VALIDAR')")
    public ResponseEntity<ProcesoCargaResponse> validar(@PathVariable Long id) {
        return ResponseEntity.ok(procesoCargaService.validarCarga(id));
    }

    @PostMapping("/{id}/publicar")
    @PreAuthorize("hasAuthority('CARGAS_PUBLICAR')")
    public ResponseEntity<ProcesoCargaResponse> publicar(@PathVariable Long id) {
        return ResponseEntity.ok(procesoCargaService.publicarCarga(id));
    }

    @GetMapping("/{id}/estado-publicacion")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<Map<String, Object>> estadoPublicacion(@PathVariable Long id) {
        return ResponseEntity.ok(procesoCargaService.consultarEstadoPublicacion(id));
    }

    @GetMapping("/{id}/errores-paginados")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<Page<ErrorCargaResponse>> listarErrores(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(procesoCargaService.listarErrores(id, pageable));
    }

    @GetMapping("/{id}/detalles")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<Page<DetalleCargaResponse>> listarDetalles(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(procesoCargaService.listarDetalles(id, pageable));
    }

    @GetMapping(value = "/{id}/reporte", produces = "text/csv")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<InputStreamResource> descargarReporte(@PathVariable Long id) {
        InputStream inputStream = procesoCargaService.descargarReporte(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_carga_" + id + ".csv\"")
                .body(new InputStreamResource(inputStream));
    }

    @GetMapping(value = "/{id}/errores", produces = "text/csv")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<InputStreamResource> descargarErrores(@PathVariable Long id) {
        InputStream inputStream = procesoCargaService.descargarErrores(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"errores_carga_" + id + ".csv\"")
                .body(new InputStreamResource(inputStream));
    }
}

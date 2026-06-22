package pe.com.banco.bi.module2.procesocarga.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResumenResponse;
import pe.com.banco.bi.module2.procesocarga.service.ProcesoCargaService;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cargas/estadisticas")
@RequiredArgsConstructor
public class ProcesoCargaEstadisticasController {

    private final ProcesoCargaService procesoCargaService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAuthority('CARGAS_VER')")
    public ResponseEntity<ProcesoCargaResumenResponse> resumen(
            @RequestParam(required = false) Long tipoCargaId,
            @RequestParam(required = false) String estados,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fechaHasta) {
        List<String> estadosList = parseEstados(estados);
        return ResponseEntity.ok(procesoCargaService.resumenCargas(tipoCargaId, estadosList, usuarioId, search, fechaDesde, fechaHasta));
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
}

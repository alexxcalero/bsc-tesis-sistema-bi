package pe.com.banco.bi.module1.campania.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;

@RestController
@RequestMapping("/api/v1/campanias")
@RequiredArgsConstructor
public class CampaniaController {

    private final CampaniaService campaniaService;

    @GetMapping
    @PreAuthorize("hasAuthority('CAMPANIAS_VER')")
    public ResponseEntity<Page<CampaniaResponse>> listar(
            @RequestParam(required = false) String codigo,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        return ResponseEntity.ok(campaniaService.listarCampanias(codigo, nombre, productoId, periodoId, estado, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAMPANIAS_VER')")
    public ResponseEntity<CampaniaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(campaniaService.obtenerCampania(id));
    }

    @PostMapping("/{id}/recalcular-metricas")
    @PreAuthorize("hasAuthority('CAMPANIAS_VER')")
    public ResponseEntity<CampaniaResponse> recalcularMetricas(@PathVariable Long id) {
        return ResponseEntity.ok(campaniaService.recalcularMetricas(id));
    }

    @GetMapping("/{id}/ofertas")
    @PreAuthorize("hasAuthority('CAMPANIAS_VER')")
    public ResponseEntity<Page<OfertaResponse>> listarOfertas(@PathVariable Long id, Pageable pageable) {
        return ResponseEntity.ok(campaniaService.listarOfertasPorCampania(id, pageable));
    }
}

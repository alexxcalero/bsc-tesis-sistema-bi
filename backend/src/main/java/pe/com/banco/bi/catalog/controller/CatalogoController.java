package pe.com.banco.bi.catalog.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.catalog.dto.*;
import pe.com.banco.bi.catalog.service.CatalogoService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalogos")
@RequiredArgsConstructor
public class CatalogoController {

    private final CatalogoService catalogoService;

    @GetMapping("/tipos-cliente")
    public ResponseEntity<List<CatalogoResponse>> tiposCliente() {
        return ResponseEntity.ok(catalogoService.listarTiposCliente());
    }

    @GetMapping("/tipos-documento")
    public ResponseEntity<List<CatalogoResponse>> tiposDocumento() {
        return ResponseEntity.ok(catalogoService.listarTiposDocumento());
    }

    @GetMapping("/segmentos")
    public ResponseEntity<List<CatalogoResponse>> segmentos() {
        return ResponseEntity.ok(catalogoService.listarSegmentos());
    }

    @GetMapping("/zonas")
    public ResponseEntity<List<CatalogoResponse>> zonas() {
        return ResponseEntity.ok(catalogoService.listarZonas());
    }

    @GetMapping("/agencias")
    public ResponseEntity<List<AgenciaResponse>> agencias() {
        return ResponseEntity.ok(catalogoService.listarAgencias());
    }

    @GetMapping("/canales")
    public ResponseEntity<List<CatalogoResponse>> canales() {
        return ResponseEntity.ok(catalogoService.listarCanales());
    }

    @GetMapping("/productos")
    public ResponseEntity<List<ProductoConSubproductosResponse>> productos() {
        return ResponseEntity.ok(catalogoService.listarProductos());
    }

    @GetMapping("/productos/{productoId}/subproductos")
    public ResponseEntity<List<SubproductoResponse>> subproductosPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(catalogoService.listarSubproductosPorProducto(productoId));
    }

    @GetMapping("/subproductos")
    public ResponseEntity<List<SubproductoResponse>> subproductos() {
        return ResponseEntity.ok(catalogoService.listarSubproductos());
    }

    @GetMapping("/filtros-oferta")
    public ResponseEntity<List<CatalogoResponse>> filtrosOferta() {
        return ResponseEntity.ok(catalogoService.listarFiltrosOferta());
    }

    @GetMapping("/periodos")
    public ResponseEntity<List<CatalogoResponse>> periodos() {
        return ResponseEntity.ok(catalogoService.listarPeriodos());
    }

    @GetMapping("/tipos-carga")
    public ResponseEntity<List<CatalogoResponse>> tiposCarga() {
        return ResponseEntity.ok(catalogoService.listarTiposCarga());
    }

    @GetMapping("/estados-carga")
    public ResponseEntity<List<CatalogoResponse>> estadosCarga() {
        return ResponseEntity.ok(catalogoService.listarEstadosCarga());
    }
}

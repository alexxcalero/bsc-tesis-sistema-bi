package pe.com.banco.bi.module1.cliente.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.cliente.dto.Cliente360Response;
import pe.com.banco.bi.module1.cliente.dto.ClienteResumenResponse;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.cliente.service.ClienteService;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<Page<ClienteResponse>> listar(
            @RequestParam(required = false) String numeroDocumento,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long segmentoId,
            @RequestParam(required = false) Long tipoClienteId,
            Pageable pageable) {
        return ResponseEntity.ok(clienteService.listarClientes(numeroDocumento, nombre, segmentoId, tipoClienteId, pageable));
    }

    @GetMapping("/resumen")
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<ClienteResumenResponse> resumen(
            @RequestParam(required = false) String numeroDocumento,
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long segmentoId,
            @RequestParam(required = false) Long tipoClienteId) {
        return ResponseEntity.ok(clienteService.resumenClientes(numeroDocumento, nombre, segmentoId, tipoClienteId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<ClienteResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerCliente(id));
    }

    @GetMapping("/{id}/detalle-360")
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<Cliente360Response> obtener360(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.obtenerCliente360(id));
    }

    @GetMapping("/{id}/campanias")
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<Page<CampaniaResponse>> listarCampaniasPorCliente(
            @PathVariable Long id,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long periodoId,
            @RequestParam(required = false) Long productoId,
            Pageable pageable) {
        return ResponseEntity.ok(clienteService.listarCampaniasPorCliente(id, estado, periodoId, productoId, pageable));
    }

    @GetMapping("/{id}/ofertas")
    @PreAuthorize("hasAuthority('CLIENTES_VER')")
    public ResponseEntity<Page<OfertaResponse>> listarOfertasPorCliente(
            @PathVariable Long id,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long campaniaId,
            @RequestParam(required = false) BigDecimal montoDesde,
            @RequestParam(required = false) BigDecimal montoHasta,
            Pageable pageable) {
        return ResponseEntity.ok(clienteService.listarOfertasPorCliente(id, estado, campaniaId, montoDesde, montoHasta, pageable));
    }
}

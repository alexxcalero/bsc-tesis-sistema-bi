package pe.com.banco.bi.module1.cliente.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.cliente.dto.Cliente360Response;
import pe.com.banco.bi.module1.cliente.dto.ClienteResumenResponse;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;

import java.math.BigDecimal;

public interface ClienteService {

    Page<ClienteResponse> listarClientes(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId, Pageable pageable);

    ClienteResumenResponse resumenClientes(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId);

    ClienteResponse obtenerCliente(Long id);

    Cliente360Response obtenerCliente360(Long id);

    Page<CampaniaResponse> listarCampaniasPorCliente(Long clienteId, String estado, Long periodoId, Long productoId, Pageable pageable);

    Page<OfertaResponse> listarOfertasPorCliente(Long clienteId, String estado, Long campaniaId, BigDecimal montoDesde, BigDecimal montoHasta, Pageable pageable);
}

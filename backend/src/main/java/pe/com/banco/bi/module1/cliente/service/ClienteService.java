package pe.com.banco.bi.module1.cliente.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.com.banco.bi.module1.cliente.dto.Cliente360Response;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;

public interface ClienteService {

    Page<ClienteResponse> listarClientes(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId, Pageable pageable);

    ClienteResponse obtenerCliente(Long id);

    Cliente360Response obtenerCliente360(Long id);
}

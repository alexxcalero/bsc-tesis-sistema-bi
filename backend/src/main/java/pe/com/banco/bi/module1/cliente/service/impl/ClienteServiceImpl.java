package pe.com.banco.bi.module1.cliente.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.mapper.CampaniaMapper;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import org.springframework.data.jpa.domain.Specification;
import pe.com.banco.bi.module1.cliente.dto.Cliente360Response;
import pe.com.banco.bi.module1.cliente.dto.ClienteResumenResponse;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.mapper.ClienteMapper;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.cliente.service.ClienteService;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;
import pe.com.banco.bi.module1.oferta.mapper.OfertaMapper;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final CampaniaRepository campaniaRepository;
    private final OfertaRepository ofertaRepository;
    private final ClienteMapper clienteMapper;
    private final CampaniaMapper campaniaMapper;
    private final OfertaMapper ofertaMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ClienteResponse> listarClientes(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId, Pageable pageable) {
        return clienteRepository.findAll(buildSpecification(numeroDocumento, nombre, segmentoId, tipoClienteId), pageable)
                .map(clienteMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResumenResponse resumenClientes(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId) {
        Specification<Cliente> spec = buildSpecification(numeroDocumento, nombre, segmentoId, tipoClienteId);
        long total = clienteRepository.count(spec);
        long naturales = clienteRepository.count(spec
                .and((root, query, cb) -> cb.equal(root.get("tipoCliente").get("codigo"), "NATURAL")));
        long juridicas = clienteRepository.count(spec
                .and((root, query, cb) -> cb.equal(root.get("tipoCliente").get("codigo"), "JURIDICA")));

        return ClienteResumenResponse.builder()
                .total(total)
                .personasNaturales(naturales)
                .personasJuridicas(juridicas)
                .build();
    }

    private Specification<Cliente> buildSpecification(String numeroDocumento, String nombre, Long segmentoId, Long tipoClienteId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (numeroDocumento != null && !numeroDocumento.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("numeroDocumento")), "%" + numeroDocumento.toLowerCase() + "%"));
            }
            if (nombre != null && !nombre.isBlank()) {
                Predicate p1 = cb.like(cb.lower(root.get("primerNombre")), "%" + nombre.toLowerCase() + "%");
                Predicate p2 = cb.like(cb.lower(root.get("apellidoPaterno")), "%" + nombre.toLowerCase() + "%");
                predicates.add(cb.or(p1, p2));
            }
            if (segmentoId != null) {
                predicates.add(cb.equal(root.get("segmento").get("id"), segmentoId));
            }
            if (tipoClienteId != null) {
                predicates.add(cb.equal(root.get("tipoCliente").get("id"), tipoClienteId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponse obtenerCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        return clienteMapper.toResponse(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public Cliente360Response obtenerCliente360(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        return Cliente360Response.builder()
                .cliente(clienteMapper.toResponse(cliente))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CampaniaResponse> listarCampaniasPorCliente(Long clienteId, String estado, Long periodoId, Long productoId, Pageable pageable) {
        return campaniaRepository.findCampaniasByClienteIdAndFilters(clienteId, estado, periodoId, productoId, pageable)
                .map(campaniaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfertaResponse> listarOfertasPorCliente(Long clienteId, String estado, Long campaniaId, BigDecimal montoDesde, BigDecimal montoHasta, Pageable pageable) {
        return ofertaRepository.findByClienteIdAndFilters(clienteId, estado, campaniaId, montoDesde, montoHasta, pageable)
                .map(ofertaMapper::toResponse);
    }
}

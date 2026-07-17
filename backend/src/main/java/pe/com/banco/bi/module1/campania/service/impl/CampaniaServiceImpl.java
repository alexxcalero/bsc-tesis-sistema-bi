package pe.com.banco.bi.module1.campania.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.dto.CampaniaResumenResponse;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.mapper.CampaniaMapper;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.oferta.dto.OfertaResumenResponse;
import pe.com.banco.bi.module1.oferta.dto.OfertaResumenTotales;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
import pe.com.banco.bi.module1.campania.service.CampaniaEstadoCalculator;
import pe.com.banco.bi.module1.oferta.mapper.OfertaMapper;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaniaServiceImpl implements CampaniaService {

    private final CampaniaRepository campaniaRepository;
    private final OfertaRepository ofertaRepository;
    private final CampaniaMapper campaniaMapper;
    private final OfertaMapper ofertaMapper;
    private final CampaniaEstadoCalculator campaniaEstadoCalculator;

    @Override
    @Transactional(readOnly = true)
    public Page<CampaniaResponse> listarCampanias(String codigo, String nombre, Long productoId, Long periodoId, String estado, Pageable pageable) {
        return campaniaRepository.findAll(buildSpecification(codigo, nombre, productoId, periodoId, estado), pageable)
                .map(campaniaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaniaResumenResponse resumenCampanias(String codigo, String nombre, Long productoId, Long periodoId, String estado) {
        Specification<Campania> spec = buildSpecification(codigo, nombre, productoId, periodoId, estado);
        long total = campaniaRepository.count(spec);
        long activas = campaniaRepository.count(spec
                .and((root, query, cb) -> cb.equal(root.get("estado"), "ACTIVA")));

        return CampaniaResumenResponse.builder()
                .total(total)
                .activas(activas)
                .build();
    }

    private Specification<Campania> buildSpecification(String codigo, String nombre, Long productoId, Long periodoId, String estado) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (codigo != null && !codigo.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("codigo")), "%" + codigo.toLowerCase() + "%"));
            }
            if (nombre != null && !nombre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")), "%" + nombre.toLowerCase() + "%"));
            }
            if (productoId != null) {
                predicates.add(cb.equal(root.get("producto").get("id"), productoId));
            }
            if (periodoId != null) {
                predicates.add(cb.equal(root.get("periodo").get("id"), periodoId));
            }
            if (estado != null && !estado.isBlank()) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    @Override
    @Transactional
    public CampaniaResponse obtenerCampania(Long id) {
        Campania campania = campaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada"));

        campaniaEstadoCalculator.aplicarEstadoCalculado(campania);

        if (debeRecalcular(campania)) {
            recalcular(campania);
        }

        CampaniaResponse response = campaniaMapper.toResponse(campaniaRepository.save(campania));
        vencerOfertasSiInactiva(campania);
        return response;
    }

    @Override
    @Transactional
    public CampaniaResponse recalcularMetricas(Long id) {
        Campania campania = campaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada"));
        recalcular(campania);
        campaniaEstadoCalculator.aplicarEstadoCalculado(campania);
        CampaniaResponse response = campaniaMapper.toResponse(campaniaRepository.save(campania));
        vencerOfertasSiInactiva(campania);
        return response;
    }

    @Override
    @Transactional
    public void recalcularMetricasPorProcesoCarga(Long procesoCargaId) {
        campaniaRepository.findByProcesoCargaId(procesoCargaId).ifPresent(campania -> {
            recalcular(campania);
            campaniaEstadoCalculator.aplicarEstadoCalculado(campania);
            campaniaRepository.save(campania);
            vencerOfertasSiInactiva(campania);
        });
    }

    private void vencerOfertasSiInactiva(Campania campania) {
        if ("INACTIVA".equals(campania.getEstado())) {
            ofertaRepository.vencerActivasPorCampania(campania.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfertaResponse> listarOfertasPorCampania(Long campaniaId, String search, Pageable pageable) {
        if (!campaniaRepository.existsById(campaniaId)) {
            throw new RuntimeException("Campaña no encontrada");
        }
        Page<Oferta> ofertas;
        String searchPattern = (search == null || search.isBlank()) ? "%" : "%" + search.toLowerCase() + "%";
        if (!"%".equals(searchPattern)) {
            ofertas = ofertaRepository.findByCampaniaIdAndSearch(campaniaId, searchPattern, pageable);
        } else {
            ofertas = ofertaRepository.findByCampaniaId(campaniaId, pageable);
        }
        return ofertas.map(ofertaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public OfertaResumenResponse resumenOfertasPorCampania(Long campaniaId, String search) {
        if (!campaniaRepository.existsById(campaniaId)) {
            throw new RuntimeException("Campaña no encontrada");
        }
        String searchPattern = (search == null || search.isBlank()) ? "%" : "%" + search.toLowerCase() + "%";
        OfertaResumenTotales resultado = ofertaRepository.calcularResumenOfertas(campaniaId, searchPattern);
        long totalOfertas = resultado.totalOfertas();
        long clientesAlcanzados = resultado.clientesAlcanzados();
        BigDecimal montoTotalOfertado = resultado.montoTotalOfertado();

        BigDecimal ticketPromedio = totalOfertas == 0
                ? BigDecimal.ZERO
                : montoTotalOfertado.divide(BigDecimal.valueOf(totalOfertas), 2, RoundingMode.HALF_UP);

        return OfertaResumenResponse.builder()
                .totalOfertas(totalOfertas)
                .clientesAlcanzados(clientesAlcanzados)
                .montoTotalOfertado(montoTotalOfertado)
                .ticketPromedio(ticketPromedio)
                .build();
    }

    private boolean debeRecalcular(Campania campania) {
        return campania.getClientesAlcanzados() == 0
                && (campania.getMontoOfertado() == null || BigDecimal.ZERO.compareTo(campania.getMontoOfertado()) == 0)
                && (campania.getTicketPromedio() == null || BigDecimal.ZERO.compareTo(campania.getTicketPromedio()) == 0);
    }

    private void recalcular(Campania campania) {
        List<Oferta> ofertas = ofertaRepository.findAllByCampaniaId(campania.getId());

        int clientesAlcanzados = (int) ofertas.stream()
                .map(oferta -> oferta.getCliente().getId())
                .distinct()
                .count();

        BigDecimal montoOfertado = ofertas.stream()
                .map(Oferta::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ticketPromedio = ofertas.isEmpty()
                ? BigDecimal.ZERO
                : montoOfertado.divide(BigDecimal.valueOf(ofertas.size()), 2, RoundingMode.HALF_UP);

        campania.setClientesAlcanzados(clientesAlcanzados);
        campania.setMontoOfertado(montoOfertado);
        campania.setTicketPromedio(ticketPromedio);
    }
}

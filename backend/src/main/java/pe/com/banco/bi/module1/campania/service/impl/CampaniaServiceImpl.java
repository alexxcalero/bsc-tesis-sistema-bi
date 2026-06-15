package pe.com.banco.bi.module1.campania.service.impl;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.mapper.CampaniaMapper;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
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

    @Override
    @Transactional(readOnly = true)
    public Page<CampaniaResponse> listarCampanias(String codigo, String nombre, Long productoId, Long periodoId, String estado, Pageable pageable) {
        return campaniaRepository.findAll((root, query, cb) -> {
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
        }, pageable).map(campaniaMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaniaResponse obtenerCampania(Long id) {
        Campania campania = campaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada"));

        if (debeRecalcular(campania)) {
            recalcular(campania);
            campania = campaniaRepository.save(campania);
        }

        return campaniaMapper.toResponse(campania);
    }

    @Override
    @Transactional
    public CampaniaResponse recalcularMetricas(Long id) {
        Campania campania = campaniaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaña no encontrada"));
        recalcular(campania);
        return campaniaMapper.toResponse(campaniaRepository.save(campania));
    }

    @Override
    @Transactional
    public void recalcularMetricasPorProcesoCarga(Long procesoCargaId) {
        campaniaRepository.findByProcesoCargaId(procesoCargaId).ifPresent(campania -> {
            recalcular(campania);
            campaniaRepository.save(campania);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OfertaResponse> listarOfertasPorCampania(Long campaniaId, Pageable pageable) {
        if (!campaniaRepository.existsById(campaniaId)) {
            throw new RuntimeException("Campaña no encontrada");
        }
        List<Oferta> ofertas = ofertaRepository.findByCampaniaId(campaniaId);
        // Convertir lista paginada manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), ofertas.size());
        List<OfertaResponse> content = ofertas.subList(start, end).stream()
                .map(ofertaMapper::toResponse)
                .toList();
        return new org.springframework.data.domain.PageImpl<>(content, pageable, ofertas.size());
    }

    private boolean debeRecalcular(Campania campania) {
        return campania.getClientesAlcanzados() == 0
                && (campania.getMontoOfertado() == null || BigDecimal.ZERO.compareTo(campania.getMontoOfertado()) == 0)
                && (campania.getTicketPromedio() == null || BigDecimal.ZERO.compareTo(campania.getTicketPromedio()) == 0);
    }

    private void recalcular(Campania campania) {
        List<Oferta> ofertas = ofertaRepository.findByCampaniaId(campania.getId());

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

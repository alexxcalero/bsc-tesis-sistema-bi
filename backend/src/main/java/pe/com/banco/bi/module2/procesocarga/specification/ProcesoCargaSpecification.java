package pe.com.banco.bi.module2.procesocarga.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProcesoCargaSpecification {

    public static Specification<ProcesoCarga> withFilters(Long tipoCargaId, Long estadoCargaId, String codigo,
                                                           LocalDateTime fechaDesde, LocalDateTime fechaHasta) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (tipoCargaId != null) {
                predicates.add(cb.equal(root.get("tipoCarga").get("id"), tipoCargaId));
            }
            if (estadoCargaId != null) {
                predicates.add(cb.equal(root.get("estadoCarga").get("id"), estadoCargaId));
            }
            if (codigo != null && !codigo.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("codigo")), "%" + codigo.toLowerCase() + "%"));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), fechaHasta));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

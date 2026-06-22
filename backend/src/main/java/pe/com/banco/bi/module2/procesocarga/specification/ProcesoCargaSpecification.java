package pe.com.banco.bi.module2.procesocarga.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ProcesoCargaSpecification {

    public static Specification<ProcesoCarga> withFilters(Long tipoCargaId, List<String> estados, Long usuarioId,
                                                           String search, LocalDateTime fechaDesde,
                                                           LocalDateTime fechaHasta) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (tipoCargaId != null) {
                predicates.add(cb.equal(root.get("tipoCarga").get("id"), tipoCargaId));
            }
            if (estados != null && !estados.isEmpty()) {
                predicates.add(root.get("estadoCarga").get("codigo").in(estados));
            }
            if (usuarioId != null) {
                predicates.add(cb.equal(root.get("usuario").get("id"), usuarioId));
            }
            if (fechaDesde != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fechaDesde));
            }
            if (fechaHasta != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), fechaHasta));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(buildSearchPredicate(root, query, cb, search));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static Predicate buildSearchPredicate(Root<ProcesoCarga> root, jakarta.persistence.criteria.CriteriaQuery<?> query,
                                                  jakarta.persistence.criteria.CriteriaBuilder cb, String search) {
        String term = "%" + search.toLowerCase() + "%";
        List<Predicate> searchPredicates = new ArrayList<>();

        searchPredicates.add(cb.like(cb.lower(root.get("codigo")), term));

        Join<ProcesoCarga, Usuario> usuarioJoin = root.join("usuario", JoinType.INNER);
        searchPredicates.add(cb.like(cb.lower(usuarioJoin.get("username")), term));
        searchPredicates.add(cb.like(cb.lower(usuarioJoin.get("primerNombre")), term));
        searchPredicates.add(cb.like(cb.lower(usuarioJoin.get("apellidoPaterno")), term));

        Subquery<Long> archivoSubquery = query.subquery(Long.class);
        Root<ArchivoCarga> archivoRoot = archivoSubquery.from(ArchivoCarga.class);
        archivoSubquery.select(archivoRoot.get("id"));
        archivoSubquery.where(
                cb.equal(archivoRoot.get("procesoCarga").get("id"), root.get("id")),
                cb.like(cb.lower(archivoRoot.get("nombreArchivo")), term)
        );
        searchPredicates.add(cb.exists(archivoSubquery));

        return cb.or(searchPredicates.toArray(new Predicate[0]));
    }
}

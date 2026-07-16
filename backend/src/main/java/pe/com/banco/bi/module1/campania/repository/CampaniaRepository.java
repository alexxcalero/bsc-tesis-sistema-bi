package pe.com.banco.bi.module1.campania.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.campania.entity.Campania;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaniaRepository extends JpaRepository<Campania, Long>, JpaSpecificationExecutor<Campania> {

    Optional<Campania> findByProcesoCargaId(Long procesoCargaId);

    Optional<Campania> findByCodigo(String codigo);

    @Query("""
            SELECT DISTINCT c FROM Campania c
            WHERE EXISTS (SELECT 1 FROM Oferta o WHERE o.campania.id = c.id AND o.cliente.id = :clienteId)
              AND (:estado IS NULL OR c.estado = :estado)
              AND (:periodoId IS NULL OR c.periodo.id = :periodoId)
              AND (:productoId IS NULL OR c.producto.id = :productoId)
            """)
    Page<Campania> findCampaniasByClienteIdAndFilters(@Param("clienteId") Long clienteId,
                                                       @Param("estado") String estado,
                                                       @Param("periodoId") Long periodoId,
                                                       @Param("productoId") Long productoId,
                                                       Pageable pageable);

    @Query("""
            SELECT c.producto.nombre, COUNT(c)
            FROM Campania c
            WHERE c.producto IS NOT NULL
            GROUP BY c.producto.nombre
            """)
    List<Object[]> countCampaniasByProducto();
}

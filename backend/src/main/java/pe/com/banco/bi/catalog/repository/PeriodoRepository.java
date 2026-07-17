package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Periodo;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodoRepository extends JpaRepository<Periodo, Long> {

    Optional<Periodo> findByCodigo(String codigo);

    @Query("SELECT DISTINCT p FROM Periodo p WHERE EXISTS (SELECT 1 FROM Campania c WHERE c.periodo = p) ORDER BY p.codigo")
    List<Periodo> findPeriodosWithCampanias();
}

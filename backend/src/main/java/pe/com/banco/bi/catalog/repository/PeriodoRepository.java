package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Periodo;

import java.util.Optional;

@Repository
public interface PeriodoRepository extends JpaRepository<Periodo, Long> {

    Optional<Periodo> findByCodigo(String codigo);
}

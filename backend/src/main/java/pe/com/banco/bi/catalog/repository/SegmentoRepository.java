package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Segmento;

import java.util.Optional;

@Repository
public interface SegmentoRepository extends JpaRepository<Segmento, Long> {

    Optional<Segmento> findByCodigo(String codigo);
}

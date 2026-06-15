package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.EstadoCarga;

import java.util.Optional;

@Repository
public interface EstadoCargaRepository extends JpaRepository<EstadoCarga, Long> {

    Optional<EstadoCarga> findByCodigo(String codigo);
}

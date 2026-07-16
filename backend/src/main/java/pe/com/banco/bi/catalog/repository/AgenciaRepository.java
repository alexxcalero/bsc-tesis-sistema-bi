package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Agencia;

import java.util.Optional;

@Repository
public interface AgenciaRepository extends JpaRepository<Agencia, Long> {

    Optional<Agencia> findByCodigo(String codigo);
}

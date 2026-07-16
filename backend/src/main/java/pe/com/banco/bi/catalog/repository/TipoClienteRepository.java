package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.TipoCliente;

import java.util.Optional;

@Repository
public interface TipoClienteRepository extends JpaRepository<TipoCliente, Long> {

    Optional<TipoCliente> findByCodigo(String codigo);
}

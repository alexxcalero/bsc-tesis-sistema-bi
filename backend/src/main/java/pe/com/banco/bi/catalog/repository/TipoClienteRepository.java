package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.TipoCliente;

@Repository
public interface TipoClienteRepository extends JpaRepository<TipoCliente, Long> {
}

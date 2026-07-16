package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Subproducto;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubproductoRepository extends JpaRepository<Subproducto, Long> {

    List<Subproducto> findByProductoId(Long productoId);

    Optional<Subproducto> findByCodigo(String codigo);
}

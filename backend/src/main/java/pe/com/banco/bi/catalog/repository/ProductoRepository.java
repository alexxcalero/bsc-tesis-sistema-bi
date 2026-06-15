package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}

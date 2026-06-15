package pe.com.banco.bi.module1.oferta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.oferta.entity.Oferta;

import java.util.List;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    List<Oferta> findByCampaniaId(Long campaniaId);

    List<Oferta> findByClienteId(Long clienteId);

    @Query("SELECT AVG(o.monto) FROM Oferta o WHERE o.estado = :estado")
    Double averageMontoByEstado(@Param("estado") String estado);
}

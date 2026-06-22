package pe.com.banco.bi.module1.oferta.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.oferta.entity.Oferta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    List<Oferta> findAllByCampaniaId(Long campaniaId);

    Page<Oferta> findByCampaniaId(Long campaniaId, Pageable pageable);

    @Query("""
            SELECT o FROM Oferta o
            WHERE o.campania.id = :campaniaId
              AND (:search IS NULL OR
                   LOWER(o.cliente.primerNombre) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(o.cliente.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(o.cliente.numeroDocumento) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Oferta> findByCampaniaIdAndSearch(@Param("campaniaId") Long campaniaId,
                                            @Param("search") String search,
                                            Pageable pageable);

    @Query("""
            SELECT o FROM Oferta o
            WHERE o.cliente.id = :clienteId
              AND (:estado IS NULL OR o.estado = :estado)
              AND (:campaniaId IS NULL OR o.campania.id = :campaniaId)
              AND (:montoDesde IS NULL OR o.monto >= :montoDesde)
              AND (:montoHasta IS NULL OR o.monto <= :montoHasta)
            """)
    Page<Oferta> findByClienteIdAndFilters(@Param("clienteId") Long clienteId,
                                            @Param("estado") String estado,
                                            @Param("campaniaId") Long campaniaId,
                                            @Param("montoDesde") BigDecimal montoDesde,
                                            @Param("montoHasta") BigDecimal montoHasta,
                                            Pageable pageable);

    List<Oferta> findByClienteId(Long clienteId);

    @Query("""
            SELECT COUNT(o), COUNT(DISTINCT o.cliente.id), COALESCE(SUM(o.monto), 0)
            FROM Oferta o
            WHERE o.campania.id = :campaniaId
              AND (:search IS NULL OR
                   LOWER(o.cliente.primerNombre) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(o.cliente.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%')) OR
                   LOWER(o.cliente.numeroDocumento) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Object[] calcularResumenOfertas(@Param("campaniaId") Long campaniaId,
                                     @Param("search") String search);

    @Query("SELECT AVG(o.monto) FROM Oferta o WHERE o.estado = :estado")
    Double averageMontoByEstado(@Param("estado") String estado);

    @Query("SELECT COALESCE(SUM(o.monto), 0) FROM Oferta o")
    BigDecimal sumMontoTotal();

    @Query("SELECT COALESCE(AVG(o.monto), 0) FROM Oferta o")
    BigDecimal promedioMontoTotal();

    @Query("""
            SELECT FUNCTION('to_char', o.fechaOferta, 'YYYY-MM'), COALESCE(SUM(o.monto), 0)
            FROM Oferta o
            WHERE o.fechaOferta >= :fechaDesde
            GROUP BY FUNCTION('to_char', o.fechaOferta, 'YYYY-MM')
            ORDER BY FUNCTION('to_char', o.fechaOferta, 'YYYY-MM')
            """)
    List<Object[]> calcularEvolucionMonto(@Param("fechaDesde") LocalDate fechaDesde);

    @Query("""
            SELECT s.nombre, COALESCE(AVG(o.monto), 0)
            FROM Oferta o
            JOIN o.cliente c
            JOIN c.segmento s
            GROUP BY s.nombre
            ORDER BY s.nombre
            """)
    List<Object[]> calcularTicketPromedioPorSegmento();
}

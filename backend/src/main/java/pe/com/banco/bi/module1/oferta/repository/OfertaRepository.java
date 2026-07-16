package pe.com.banco.bi.module1.oferta.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.oferta.dto.OfertaResumenTotales;
import pe.com.banco.bi.module1.oferta.entity.Oferta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    Optional<Oferta> findByCampaniaIdAndClienteIdAndFechaOferta(Long campaniaId, Long clienteId, LocalDate fechaOferta);

    List<Oferta> findAllByCampaniaId(Long campaniaId);

    Page<Oferta> findByCampaniaId(Long campaniaId, Pageable pageable);

    @Query("""
            SELECT o FROM Oferta o
            WHERE o.campania.id = :campaniaId
              AND (LENGTH(:searchPattern) = 1 OR
                   LOWER(o.cliente.primerNombre) LIKE :searchPattern OR
                   LOWER(o.cliente.apellidoPaterno) LIKE :searchPattern OR
                   LOWER(o.cliente.numeroDocumento) LIKE :searchPattern)
            """)
    Page<Oferta> findByCampaniaIdAndSearch(@Param("campaniaId") Long campaniaId,
                                             @Param("searchPattern") String searchPattern,
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
            SELECT new pe.com.banco.bi.module1.oferta.dto.OfertaResumenTotales(
                COUNT(o), COUNT(DISTINCT o.cliente.id), COALESCE(SUM(o.monto), 0)
            )
            FROM Oferta o
            WHERE o.campania.id = :campaniaId
              AND (LENGTH(:searchPattern) = 1 OR
                   LOWER(o.cliente.primerNombre) LIKE :searchPattern OR
                   LOWER(o.cliente.apellidoPaterno) LIKE :searchPattern OR
                   LOWER(o.cliente.numeroDocumento) LIKE :searchPattern)
            """)
    OfertaResumenTotales calcularResumenOfertas(@Param("campaniaId") Long campaniaId,
                                                 @Param("searchPattern") String searchPattern);

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

    @Query("""
            SELECT
                COUNT(DISTINCT o.campania.id),
                COUNT(DISTINCT o.cliente.id),
                COUNT(o),
                COALESCE(SUM(o.monto), 0),
                COALESCE(AVG(o.monto), 0)
            FROM Oferta o
            WHERE (:fechaDesde IS NULL OR o.fechaOferta >= :fechaDesde)
              AND (:fechaHasta IS NULL OR o.fechaOferta <= :fechaHasta)
              AND (:estadoCampania IS NULL OR o.campania.estado = :estadoCampania)
              AND (:productoId IS NULL OR o.campania.producto.id = :productoId)
              AND (:periodoId IS NULL OR o.campania.periodo.id = :periodoId)
              AND (:segmentoId IS NULL OR o.cliente.segmento.id = :segmentoId)
            """)
    Object[] calcularKpisConFiltros(@Param("fechaDesde") LocalDate fechaDesde,
                                    @Param("fechaHasta") LocalDate fechaHasta,
                                    @Param("estadoCampania") String estadoCampania,
                                    @Param("productoId") Long productoId,
                                    @Param("periodoId") Long periodoId,
                                    @Param("segmentoId") Long segmentoId);

    @Query("""
            SELECT o.campania.producto.nombre, COUNT(DISTINCT o.campania.id)
            FROM Oferta o
            WHERE (:fechaDesde IS NULL OR o.fechaOferta >= :fechaDesde)
              AND (:fechaHasta IS NULL OR o.fechaOferta <= :fechaHasta)
              AND (:estadoCampania IS NULL OR o.campania.estado = :estadoCampania)
              AND (:productoId IS NULL OR o.campania.producto.id = :productoId)
              AND (:periodoId IS NULL OR o.campania.periodo.id = :periodoId)
              AND (:segmentoId IS NULL OR o.cliente.segmento.id = :segmentoId)
            GROUP BY o.campania.producto.nombre
            ORDER BY o.campania.producto.nombre
            """)
    List<Object[]> countCampaniasByProductoConFiltros(@Param("fechaDesde") LocalDate fechaDesde,
                                                      @Param("fechaHasta") LocalDate fechaHasta,
                                                      @Param("estadoCampania") String estadoCampania,
                                                      @Param("productoId") Long productoId,
                                                      @Param("periodoId") Long periodoId,
                                                      @Param("segmentoId") Long segmentoId);

    @Query("""
            SELECT FUNCTION('to_char', o.fechaOferta, 'YYYY-MM'), COALESCE(SUM(o.monto), 0)
            FROM Oferta o
            WHERE (:fechaDesde IS NULL OR o.fechaOferta >= :fechaDesde)
              AND (:fechaHasta IS NULL OR o.fechaOferta <= :fechaHasta)
              AND (:estadoCampania IS NULL OR o.campania.estado = :estadoCampania)
              AND (:productoId IS NULL OR o.campania.producto.id = :productoId)
              AND (:periodoId IS NULL OR o.campania.periodo.id = :periodoId)
              AND (:segmentoId IS NULL OR o.cliente.segmento.id = :segmentoId)
            GROUP BY FUNCTION('to_char', o.fechaOferta, 'YYYY-MM')
            ORDER BY FUNCTION('to_char', o.fechaOferta, 'YYYY-MM')
            """)
    List<Object[]> calcularEvolucionMontoConFiltros(@Param("fechaDesde") LocalDate fechaDesde,
                                                    @Param("fechaHasta") LocalDate fechaHasta,
                                                    @Param("estadoCampania") String estadoCampania,
                                                    @Param("productoId") Long productoId,
                                                    @Param("periodoId") Long periodoId,
                                                    @Param("segmentoId") Long segmentoId);

    @Query("""
            SELECT s.nombre, COALESCE(AVG(o.monto), 0)
            FROM Oferta o
            JOIN o.cliente c
            JOIN c.segmento s
            WHERE (:fechaDesde IS NULL OR o.fechaOferta >= :fechaDesde)
              AND (:fechaHasta IS NULL OR o.fechaOferta <= :fechaHasta)
              AND (:estadoCampania IS NULL OR o.campania.estado = :estadoCampania)
              AND (:productoId IS NULL OR o.campania.producto.id = :productoId)
              AND (:periodoId IS NULL OR o.campania.periodo.id = :periodoId)
              AND (:segmentoId IS NULL OR c.segmento.id = :segmentoId)
            GROUP BY s.nombre
            ORDER BY s.nombre
            """)
    List<Object[]> calcularTicketPromedioPorSegmentoConFiltros(@Param("fechaDesde") LocalDate fechaDesde,
                                                               @Param("fechaHasta") LocalDate fechaHasta,
                                                               @Param("estadoCampania") String estadoCampania,
                                                               @Param("productoId") Long productoId,
                                                               @Param("periodoId") Long periodoId,
                                                               @Param("segmentoId") Long segmentoId);
}

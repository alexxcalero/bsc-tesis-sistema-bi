package pe.com.banco.bi.module2.procesocarga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaTotales;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProcesoCargaRepository extends JpaRepository<ProcesoCarga, Long>, JpaSpecificationExecutor<ProcesoCarga> {

    @Query("""
            SELECT DISTINCT p.usuario
            FROM ProcesoCarga p
            ORDER BY p.usuario.primerNombre, p.usuario.apellidoPaterno
            """)
    List<Usuario> findUsuariosResponsables();

    @Query("""
            SELECT new pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaTotales(
                COALESCE(SUM(p.totalRegistros), 0),
                COALESCE(SUM(p.totalRegValidos), 0),
                COALESCE(SUM(p.totalRegInvalidos), 0)
            )
            FROM ProcesoCarga p
            WHERE (:tipoCargaId IS NULL OR p.tipoCarga.id = :tipoCargaId)
              AND (:estados IS NULL OR :estados IS EMPTY OR p.estadoCarga.codigo IN :estados)
              AND (:usuarioId IS NULL OR p.usuario.id = :usuarioId)
              AND (:fechaDesde IS NULL OR p.createdAt >= :fechaDesde)
              AND (:fechaHasta IS NULL OR p.createdAt <= :fechaHasta)
              AND (:search IS NULL OR LOWER(p.codigo) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.usuario.username) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.usuario.primerNombre) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR LOWER(p.usuario.apellidoPaterno) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR EXISTS (SELECT 1 FROM ArchivoCarga a WHERE a.procesoCarga.id = p.id
                              AND LOWER(a.nombreArchivo) LIKE LOWER(CONCAT('%', :search, '%'))))
            """)
    Optional<ProcesoCargaTotales> calcularTotales(@Param("tipoCargaId") Long tipoCargaId,
                                                  @Param("estados") List<String> estados,
                                                  @Param("usuarioId") Long usuarioId,
                                                  @Param("search") String search,
                                                  @Param("fechaDesde") LocalDateTime fechaDesde,
                                                  @Param("fechaHasta") LocalDateTime fechaHasta);
}

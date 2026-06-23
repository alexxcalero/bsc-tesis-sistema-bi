package pe.com.banco.bi.module2.procesocarga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaTotales;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.util.List;

@Repository
public interface ProcesoCargaRepository extends JpaRepository<ProcesoCarga, Long>, JpaSpecificationExecutor<ProcesoCarga> {

    @Query("""
            SELECT DISTINCT p.usuario
            FROM ProcesoCarga p
            ORDER BY p.usuario.primerNombre, p.usuario.apellidoPaterno
            """)
    List<Usuario> findUsuariosResponsables();

}

package pe.com.banco.bi.module1.reporte.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.reporte.entity.Reporte;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {

    List<Reporte> findAllByActivoTrueOrderByNombre();

    Optional<Reporte> findByCodigoIgnoreCase(String codigo);
}

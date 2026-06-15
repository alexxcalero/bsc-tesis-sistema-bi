package pe.com.banco.bi.module2.detallecarga.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.detallecarga.entity.DetalleCarga;

import java.util.List;

@Repository
public interface DetalleCargaRepository extends JpaRepository<DetalleCarga, Long> {

    List<DetalleCarga> findByProcesoCargaId(Long procesoCargaId);

    Page<DetalleCarga> findByProcesoCargaId(Long procesoCargaId, Pageable pageable);

    long countByProcesoCargaIdAndEsValido(Long procesoCargaId, Boolean esValido);
}

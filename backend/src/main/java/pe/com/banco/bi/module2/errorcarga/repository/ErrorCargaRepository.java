package pe.com.banco.bi.module2.errorcarga.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.errorcarga.entity.ErrorCarga;

import java.util.List;

@Repository
public interface ErrorCargaRepository extends JpaRepository<ErrorCarga, Long> {

    List<ErrorCarga> findByProcesoCargaId(Long procesoCargaId);

    Page<ErrorCarga> findByProcesoCargaId(Long procesoCargaId, Pageable pageable);

    void deleteByProcesoCargaIdAndTipoError(Long procesoCargaId, String tipoError);

    void deleteByProcesoCargaId(Long procesoCargaId);
}

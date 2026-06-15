package pe.com.banco.bi.module2.resultadocarga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;

import java.util.Optional;

@Repository
public interface ResultadoCargaRepository extends JpaRepository<ResultadoCarga, Long> {

    Optional<ResultadoCarga> findByProcesoCargaId(Long procesoCargaId);
}

package pe.com.banco.bi.module2.procesocarga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

@Repository
public interface ProcesoCargaRepository extends JpaRepository<ProcesoCarga, Long>, JpaSpecificationExecutor<ProcesoCarga> {
}

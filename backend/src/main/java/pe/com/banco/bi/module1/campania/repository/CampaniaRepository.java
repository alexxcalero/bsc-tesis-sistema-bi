package pe.com.banco.bi.module1.campania.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module1.campania.entity.Campania;

import java.util.Optional;

@Repository
public interface CampaniaRepository extends JpaRepository<Campania, Long>, JpaSpecificationExecutor<Campania> {

    Optional<Campania> findByProcesoCargaId(Long procesoCargaId);
}

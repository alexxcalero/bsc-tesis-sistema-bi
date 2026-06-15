package pe.com.banco.bi.module2.archivocarga.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;

import java.util.Optional;

@Repository
public interface ArchivoCargaRepository extends JpaRepository<ArchivoCarga, Long> {

    Optional<ArchivoCarga> findByProcesoCargaId(Long procesoCargaId);
}

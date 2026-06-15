package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Canal;

@Repository
public interface CanalRepository extends JpaRepository<Canal, Long> {
}

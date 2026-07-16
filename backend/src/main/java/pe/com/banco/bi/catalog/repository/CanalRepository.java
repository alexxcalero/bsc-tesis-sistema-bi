package pe.com.banco.bi.catalog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pe.com.banco.bi.catalog.entity.Canal;

import java.util.Optional;

@Repository
public interface CanalRepository extends JpaRepository<Canal, Long> {

    Optional<Canal> findByCodigo(String codigo);
}

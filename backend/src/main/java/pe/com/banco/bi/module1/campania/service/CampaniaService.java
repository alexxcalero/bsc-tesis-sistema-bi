package pe.com.banco.bi.module1.campania.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;

public interface CampaniaService {

    Page<CampaniaResponse> listarCampanias(String codigo, String nombre, Long productoId, Long periodoId, String estado, Pageable pageable);

    CampaniaResponse obtenerCampania(Long id);

    CampaniaResponse recalcularMetricas(Long id);

    void recalcularMetricasPorProcesoCarga(Long procesoCargaId);

    Page<OfertaResponse> listarOfertasPorCampania(Long campaniaId, Pageable pageable);
}

package pe.com.banco.bi.module2.procesocarga.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import pe.com.banco.bi.module2.detallecarga.dto.DetalleCargaResponse;
import pe.com.banco.bi.module2.errorcarga.dto.ErrorCargaResponse;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaRequest;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResponse;

import java.time.LocalDateTime;

public interface ProcesoCargaService {

    ProcesoCargaResponse registrarCarga(ProcesoCargaRequest request, MultipartFile file, Long usuarioId);

    Page<ProcesoCargaResponse> listarCargas(Long tipoCargaId, Long estadoCargaId, String codigo,
                                             LocalDateTime fechaDesde, LocalDateTime fechaHasta, Pageable pageable);

    ProcesoCargaResponse obtenerCarga(Long id);

    ProcesoCargaResponse validarCarga(Long id);

    ProcesoCargaResponse publicarCarga(Long id);

    Page<ErrorCargaResponse> listarErrores(Long procesoCargaId, Pageable pageable);

    Page<DetalleCargaResponse> listarDetalles(Long procesoCargaId, Pageable pageable);
}

package pe.com.banco.bi.module2.procesocarga.service.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.entity.TipoCarga;
import pe.com.banco.bi.catalog.repository.EstadoCargaRepository;
import pe.com.banco.bi.catalog.repository.TipoCargaRepository;
import pe.com.banco.bi.module2.archivocarga.entity.ArchivoCarga;
import pe.com.banco.bi.module2.archivocarga.repository.ArchivoCargaRepository;
import pe.com.banco.bi.module2.common.event.CargaRegistradaEvent;
import pe.com.banco.bi.module2.common.storage.StorageService;
import pe.com.banco.bi.module2.detallecarga.dto.DetalleCargaResponse;
import pe.com.banco.bi.module2.detallecarga.entity.DetalleCarga;
import pe.com.banco.bi.module2.detallecarga.repository.DetalleCargaRepository;
import pe.com.banco.bi.module2.errorcarga.dto.ErrorCargaResponse;
import pe.com.banco.bi.module2.errorcarga.entity.ErrorCarga;
import pe.com.banco.bi.module2.errorcarga.repository.ErrorCargaRepository;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaRequest;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResumenResponse;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaResponse;
import pe.com.banco.bi.module2.procesocarga.dto.ProcesoCargaTotales;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.procesocarga.mapper.ProcesoCargaMapper;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;
import pe.com.banco.bi.module2.procesocarga.service.ProcesoCargaService;
import pe.com.banco.bi.module2.procesocarga.specification.ProcesoCargaSpecification;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.module2.resultadocarga.entity.ResultadoCarga;
import pe.com.banco.bi.module2.resultadocarga.repository.ResultadoCargaRepository;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;
import pe.com.banco.bi.securitydomain.usuario.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProcesoCargaServiceImpl implements ProcesoCargaService {

    private final ProcesoCargaRepository procesoCargaRepository;
    private final ArchivoCargaRepository archivoCargaRepository;
    private final DetalleCargaRepository detalleCargaRepository;
    private final ErrorCargaRepository errorCargaRepository;
    private final ResultadoCargaRepository resultadoCargaRepository;
    private final TipoCargaRepository tipoCargaRepository;
    private final EstadoCargaRepository estadoCargaRepository;
    private final UsuarioRepository usuarioRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;
    private final ProcesoCargaMapper procesoCargaMapper;
    private final CampaniaService campaniaService;

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    @Transactional
    public ProcesoCargaResponse registrarCarga(ProcesoCargaRequest request, MultipartFile file, Long usuarioId) {
        if (file.isEmpty()) {
            throw new RuntimeException("El archivo no puede estar vacío");
        }

        TipoCarga tipoCarga = tipoCargaRepository.findById(request.getTipoCargaId())
                .orElseThrow(() -> new RuntimeException("Tipo de carga no encontrado"));

        EstadoCarga estadoPendiente = estadoCargaRepository.findByCodigo("PENDIENTE")
                .orElseThrow(() -> new RuntimeException("Estado PENDIENTE no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String codigo = "CARGA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        ProcesoCarga proceso = ProcesoCarga.builder()
                .codigo(codigo)
                .tipoCarga(tipoCarga)
                .estadoCarga(estadoPendiente)
                .usuario(usuario)
                .observacion(request.getObservacion())
                .totalRegistros(0)
                .totalRegValidos(0)
                .totalRegInvalidos(0)
                .build();

        proceso = procesoCargaRepository.save(proceso);

        String storedFilename;
        try {
            storedFilename = storageService.store(file.getOriginalFilename(), file.getInputStream());
        } catch (Exception e) {
            throw new RuntimeException("Error al almacenar archivo", e);
        }

        ArchivoCarga archivo = ArchivoCarga.builder()
                .nombreArchivo(file.getOriginalFilename())
                .tipoArchivo(file.getContentType())
                .tamanoArchivo(file.getSize())
                .rutaArchivo(storedFilename)
                .procesoCarga(proceso)
                .build();

        archivoCargaRepository.save(archivo);

        eventPublisher.publishEvent(new CargaRegistradaEvent(proceso.getId()));

        return buildResponse(proceso);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProcesoCargaResponse> listarCargas(Long tipoCargaId, List<String> estados, Long usuarioId, String search,
                                                    LocalDateTime fechaDesde, LocalDateTime fechaHasta, Pageable pageable) {
        return procesoCargaRepository.findAll(
                ProcesoCargaSpecification.withFilters(tipoCargaId, estados, usuarioId, search, fechaDesde, fechaHasta),
                pageable
        ).map(this::buildResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProcesoCargaResumenResponse resumenCargas(Long tipoCargaId, List<String> estados, Long usuarioId, String search,
                                                      LocalDateTime fechaDesde, LocalDateTime fechaHasta) {
        Specification<ProcesoCarga> spec = ProcesoCargaSpecification.withFilters(tipoCargaId, estados, usuarioId, search, fechaDesde, fechaHasta);

        long total = procesoCargaRepository.count(spec);
        long pendientes = contarPorEstado(spec, "PENDIENTE");
        long enValidacion = contarPorEstado(spec, "EN_VALIDACION");
        long validadas = contarPorEstado(spec, "VALIDADA");
        long conErrores = contarPorEstado(spec, "CON_ERRORES");
        long publicadas = contarPorEstado(spec, "PUBLICADA");
        long rechazadas = contarPorEstado(spec, "RECHAZADA");

        ProcesoCargaTotales totales = calcularTotalesCriteria(tipoCargaId, estados, usuarioId, search, fechaDesde, fechaHasta);
        Long totalRegistros = totales.totalRegistros();
        Long totalRegValidos = totales.totalRegValidos();
        Long totalRegInvalidos = totales.totalRegInvalidos();

        return ProcesoCargaResumenResponse.builder()
                .total(total)
                .pendientes(pendientes)
                .enValidacion(enValidacion)
                .validadas(validadas)
                .conErrores(conErrores)
                .publicadas(publicadas)
                .rechazadas(rechazadas)
                .totalRegistros(totalRegistros)
                .totalRegValidos(totalRegValidos)
                .totalRegInvalidos(totalRegInvalidos)
                .build();
    }

    private long contarPorEstado(Specification<ProcesoCarga> baseSpec, String codigoEstado) {
        return procesoCargaRepository.count(baseSpec
                .and((root, query, cb) -> cb.equal(root.get("estadoCarga").get("codigo"), codigoEstado)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProcesoCargaResponse obtenerCarga(Long id) {
        ProcesoCarga proceso = procesoCargaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado"));
        return buildResponse(proceso);
    }

    @Override
    @Transactional
    public ProcesoCargaResponse validarCarga(Long id) {
        ProcesoCarga proceso = procesoCargaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado"));

        eventPublisher.publishEvent(new CargaRegistradaEvent(proceso.getId()));
        return buildResponse(proceso);
    }

    @Override
    @Transactional
    public ProcesoCargaResponse publicarCarga(Long id) {
        ProcesoCarga proceso = procesoCargaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado"));

        if (!"VALIDADA".equals(proceso.getEstadoCarga().getCodigo()) && !"CON_ERRORES".equals(proceso.getEstadoCarga().getCodigo())) {
            throw new RuntimeException("Solo se pueden publicar cargas validadas o con errores");
        }

        EstadoCarga estadoPublicada = estadoCargaRepository.findByCodigo("PUBLICADA")
                .orElseThrow(() -> new RuntimeException("Estado PUBLICADA no encontrado"));

        proceso.setEstadoCarga(estadoPublicada);
        procesoCargaRepository.save(proceso);

        ResultadoCarga resultado = resultadoCargaRepository.findByProcesoCargaId(id)
                .orElseThrow(() -> new RuntimeException("Resultado no encontrado"));

        long validos = detalleCargaRepository.countByProcesoCargaIdAndEsValido(id, true);
        resultado.setTotalRegistrosProcesados((int) validos);
        resultadoCargaRepository.save(resultado);

        try {
            campaniaService.recalcularMetricasPorProcesoCarga(id);
        } catch (Exception e) {
            // Si no hay campaña vinculada u ocurre cualquier error, no detener la publicación
        }

        return buildResponse(proceso);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ErrorCargaResponse> listarErrores(Long procesoCargaId, Pageable pageable) {
        return errorCargaRepository.findByProcesoCargaId(procesoCargaId, pageable)
                .map(e -> ErrorCargaResponse.builder()
                        .id(e.getId())
                        .numeroFila(e.getNumeroFila())
                        .campo(e.getCampo())
                        .mensajeError(e.getMensajeError())
                        .tipoError(e.getTipoError())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DetalleCargaResponse> listarDetalles(Long procesoCargaId, Pageable pageable) {
        return detalleCargaRepository.findByProcesoCargaId(procesoCargaId, pageable)
                .map(d -> DetalleCargaResponse.builder()
                        .id(d.getId())
                        .numeroFila(d.getNumeroFila())
                        .datosFila(d.getDatosFila())
                        .esValido(d.getEsValido())
                        .observaciones(d.getObservaciones())
                        .build());
    }

    private ProcesoCargaResponse buildResponse(ProcesoCarga proceso) {
        ProcesoCargaResponse response = procesoCargaMapper.toResponse(proceso);
        archivoCargaRepository.findByProcesoCargaId(proceso.getId())
                .ifPresent(a -> response.setArchivo(procesoCargaMapper.toArchivoResponse(a)));
        resultadoCargaRepository.findByProcesoCargaId(proceso.getId())
                .ifPresent(r -> response.setResultado(procesoCargaMapper.toResultadoResponse(r)));
        return response;
    }

    private ProcesoCargaTotales calcularTotalesCriteria(Long tipoCargaId, List<String> estados, Long usuarioId,
                                                        String search, LocalDateTime fechaDesde, LocalDateTime fechaHasta) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<ProcesoCarga> root = query.from(ProcesoCarga.class);

        List<Predicate> predicates = new ArrayList<>();
        if (tipoCargaId != null) {
            predicates.add(cb.equal(root.get("tipoCarga").get("id"), tipoCargaId));
        }
        if (estados != null && !estados.isEmpty()) {
            predicates.add(root.get("estadoCarga").get("codigo").in(estados));
        }
        if (usuarioId != null) {
            predicates.add(cb.equal(root.get("usuario").get("id"), usuarioId));
        }
        if (fechaDesde != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fechaDesde));
        }
        if (fechaHasta != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), fechaHasta));
        }
        if (search != null && !search.isBlank()) {
            String pattern = "%" + search.toLowerCase() + "%";
            Predicate codigo = cb.like(cb.lower(root.get("codigo")), pattern);
            Predicate username = cb.like(cb.lower(root.get("usuario").get("username")), pattern);
            Predicate primerNombre = cb.like(cb.lower(root.get("usuario").get("primerNombre")), pattern);
            Predicate apellidoPaterno = cb.like(cb.lower(root.get("usuario").get("apellidoPaterno")), pattern);

            Subquery<Long> subquery = query.subquery(Long.class);
            Root<ArchivoCarga> archivoRoot = subquery.from(ArchivoCarga.class);
            subquery.select(cb.literal(1L));
            subquery.where(
                    cb.equal(archivoRoot.get("procesoCarga").get("id"), root.get("id")),
                    cb.like(cb.lower(archivoRoot.get("nombreArchivo")), pattern)
            );

            predicates.add(cb.or(codigo, username, primerNombre, apellidoPaterno, cb.exists(subquery)));
        }

        query.where(predicates.toArray(new Predicate[0]));

        Expression<Long> sumTotal = cb.coalesce(cb.sum(root.get("totalRegistros")), 0L);
        Expression<Long> sumValidos = cb.coalesce(cb.sum(root.get("totalRegValidos")), 0L);
        Expression<Long> sumInvalidos = cb.coalesce(cb.sum(root.get("totalRegInvalidos")), 0L);
        query.multiselect(sumTotal, sumValidos, sumInvalidos);

        Object[] result = entityManager.createQuery(query).getSingleResult();
        return new ProcesoCargaTotales(
                ((Number) result[0]).longValue(),
                ((Number) result[1]).longValue(),
                ((Number) result[2]).longValue()
        );
    }
}

package pe.com.banco.bi.catalog.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.com.banco.bi.catalog.dto.*;
import pe.com.banco.bi.catalog.mapper.CatalogoMapper;
import pe.com.banco.bi.catalog.repository.*;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogoService {

    private final TipoClienteRepository tipoClienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final SegmentoRepository segmentoRepository;
    private final ZonaRepository zonaRepository;
    private final AgenciaRepository agenciaRepository;
    private final CanalRepository canalRepository;
    private final ProductoRepository productoRepository;
    private final SubproductoRepository subproductoRepository;
    private final FiltroOfertaRepository filtroOfertaRepository;
    private final PeriodoRepository periodoRepository;
    private final TipoCargaRepository tipoCargaRepository;
    private final EstadoCargaRepository estadoCargaRepository;
    private final CatalogoMapper catalogoMapper;

    public List<CatalogoResponse> listarTiposCliente() {
        return tipoClienteRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarTiposDocumento() {
        return tipoDocumentoRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarSegmentos() {
        return segmentoRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarZonas() {
        return zonaRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<AgenciaResponse> listarAgencias() {
        return agenciaRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarCanales() {
        return canalRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<ProductoConSubproductosResponse> listarProductos() {
        return productoRepository.findAll().stream()
                .map(p -> catalogoMapper.toProductoConSubproductos(p, subproductoRepository.findByProductoId(p.getId())))
                .toList();
    }

    public List<SubproductoResponse> listarSubproductos() {
        return subproductoRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<SubproductoResponse> listarSubproductosPorProducto(Long productoId) {
        return subproductoRepository.findByProductoId(productoId).stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarFiltrosOferta() {
        return filtroOfertaRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarPeriodos() {
        return periodoRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarTiposCarga() {
        return tipoCargaRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }

    public List<CatalogoResponse> listarEstadosCarga() {
        return estadoCargaRepository.findAll().stream()
                .map(catalogoMapper::toResponse)
                .toList();
    }
}

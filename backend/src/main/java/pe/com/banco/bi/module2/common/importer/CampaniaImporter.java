package pe.com.banco.bi.module2.common.importer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.catalog.entity.Periodo;
import pe.com.banco.bi.catalog.entity.Producto;
import pe.com.banco.bi.catalog.entity.Subproducto;
import pe.com.banco.bi.catalog.repository.PeriodoRepository;
import pe.com.banco.bi.catalog.repository.ProductoRepository;
import pe.com.banco.bi.catalog.repository.SubproductoRepository;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;
import pe.com.banco.bi.module2.procesocarga.repository.ProcesoCargaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class CampaniaImporter implements CargaDataImporter {

    private final CampaniaRepository campaniaRepository;
    private final ProcesoCargaRepository procesoCargaRepository;
    private final PeriodoRepository periodoRepository;
    private final ProductoRepository productoRepository;
    private final SubproductoRepository subproductoRepository;

    @Override
    public boolean soporta(String tipoCargaCodigo) {
        return "CAMPANIAS".equalsIgnoreCase(tipoCargaCodigo);
    }

    @Override
    @Transactional
    public ImportResult importar(Long procesoCargaId, List<String[]> filas) {
        if (filas.isEmpty()) {
            return ImportResult.vacio();
        }

        ProcesoCarga procesoCarga = procesoCargaRepository.findById(procesoCargaId)
                .orElseThrow(() -> new RuntimeException("Proceso de carga no encontrado: " + procesoCargaId));

        List<ImportError> errores = new ArrayList<>();
        Set<Long> campaniasAfectadas = new HashSet<>();
        int procesadas = 0;

        for (int i = 0; i < filas.size(); i++) {
            String[] cols = filas.get(i);
            int numeroFila = i + 1;

            try {
                String codigo = cols[0].trim();
                String nombre = cols[1].trim();
                String descripcion = cols.length > 2 ? cols[2].trim() : null;
                String fechaInicioStr = cols.length > 3 ? cols[3].trim() : null;
                String fechaFinStr = cols.length > 4 ? cols[4].trim() : null;
                String estado = cols.length > 5 ? cols[5].trim() : null;
                String periodoCodigo = cols.length > 6 ? cols[6].trim() : null;
                String productoCodigo = cols.length > 7 ? cols[7].trim() : null;
                String subproductoCodigo = cols.length > 8 ? cols[8].trim() : null;

                LocalDate fechaInicio = (fechaInicioStr != null && !fechaInicioStr.isBlank()) ? LocalDate.parse(fechaInicioStr) : null;
                LocalDate fechaFin = (fechaFinStr != null && !fechaFinStr.isBlank()) ? LocalDate.parse(fechaFinStr) : null;

                Optional<Periodo> periodo = (periodoCodigo != null && !periodoCodigo.isBlank())
                        ? periodoRepository.findByCodigo(periodoCodigo) : Optional.empty();
                Optional<Producto> producto = (productoCodigo != null && !productoCodigo.isBlank())
                        ? productoRepository.findByCodigo(productoCodigo) : Optional.empty();
                Optional<Subproducto> subproducto = (subproductoCodigo != null && !subproductoCodigo.isBlank() && !"N/A".equalsIgnoreCase(subproductoCodigo))
                        ? subproductoRepository.findByCodigo(subproductoCodigo) : Optional.empty();

                Campania campania = campaniaRepository.findByCodigo(codigo).orElse(null);
                if (campania == null) {
                    campania = Campania.builder()
                            .codigo(codigo)
                            .nombre(nombre)
                            .descripcion(descripcion)
                            .estado(estado)
                            .fechaInicio(fechaInicio)
                            .fechaFin(fechaFin)
                            .periodo(periodo.orElse(null))
                            .producto(producto.orElse(null))
                            .subproducto(subproducto.orElse(null))
                            .procesoCarga(procesoCarga)
                            .clientesAlcanzados(0)
                            .montoOfertado(BigDecimal.ZERO)
                            .ticketPromedio(BigDecimal.ZERO)
                            .build();
                } else {
                    campania.setNombre(nombre);
                    campania.setDescripcion(descripcion);
                    campania.setEstado(estado);
                    campania.setFechaInicio(fechaInicio);
                    campania.setFechaFin(fechaFin);
                    campania.setPeriodo(periodo.orElse(null));
                    campania.setProducto(producto.orElse(null));
                    campania.setSubproducto(subproducto.orElse(null));
                }

                Campania guardada = campaniaRepository.save(campania);
                campaniasAfectadas.add(guardada.getId());
                procesadas++;
            } catch (Exception e) {
                errores.add(ImportError.builder()
                        .numeroFila(numeroFila)
                        .campo("GENERAL")
                        .tipoError("IMPORTACION")
                        .mensajeError("Fila " + numeroFila + ": error inesperado al importar: " + e.getMessage())
                        .build());
            }
        }

        return ImportResult.builder()
                .totalFilas(filas.size())
                .filasProcesadas(procesadas)
                .errores(errores)
                .campaniasAfectadas(campaniasAfectadas)
                .build();
    }
}

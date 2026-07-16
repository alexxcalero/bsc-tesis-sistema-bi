package pe.com.banco.bi.module2.common.importer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.oferta.entity.Oferta;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class OfertaImporter implements CargaDataImporter {

    private final CampaniaRepository campaniaRepository;
    private final ClienteRepository clienteRepository;
    private final OfertaRepository ofertaRepository;

    @Override
    public boolean soporta(String tipoCargaCodigo) {
        return "OFERTAS".equalsIgnoreCase(tipoCargaCodigo);
    }

    @Override
    @Transactional
    public ImportResult importar(Long procesoCargaId, List<String[]> filas) {
        if (filas.isEmpty()) {
            return ImportResult.vacio();
        }

        List<ImportError> errores = new ArrayList<>();
        Set<Long> campaniasAfectadas = new HashSet<>();
        int procesadas = 0;

        for (int i = 0; i < filas.size(); i++) {
            String[] cols = filas.get(i);
            int numeroFila = i + 1;

            try {
                String campaniaCodigo = cols[0].trim();
                String clienteNumeroDocumento = cols[1].trim();
                String montoStr = cols[2].trim();
                String tasaStr = cols.length > 3 ? cols[3].trim() : null;
                String fechaOfertaStr = cols.length > 4 ? cols[4].trim() : null;
                String estado = cols.length > 5 ? cols[5].trim() : null;

                Campania campania = campaniaRepository.findByCodigo(campaniaCodigo)
                        .orElseThrow(() -> new RuntimeException("Campaña no encontrada: " + campaniaCodigo));
                Cliente cliente = clienteRepository.findByNumeroDocumento(clienteNumeroDocumento)
                        .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + clienteNumeroDocumento));

                BigDecimal monto = new BigDecimal(montoStr);
                BigDecimal tasa = (tasaStr != null && !tasaStr.isBlank()) ? new BigDecimal(tasaStr) : null;
                LocalDate fechaOferta = (fechaOfertaStr != null && !fechaOfertaStr.isBlank())
                        ? LocalDate.parse(fechaOfertaStr)
                        : LocalDate.now();
                String estadoFinal = (estado == null || estado.isBlank()) ? "PENDIENTE" : estado;

                Oferta oferta = ofertaRepository
                        .findByCampaniaIdAndClienteIdAndFechaOferta(campania.getId(), cliente.getId(), fechaOferta)
                        .orElse(null);
                if (oferta == null) {
                    oferta = Oferta.builder()
                            .campania(campania)
                            .cliente(cliente)
                            .monto(monto)
                            .tasa(tasa)
                            .fechaOferta(fechaOferta)
                            .estado(estadoFinal)
                            .build();
                } else {
                    oferta.setMonto(monto);
                    oferta.setTasa(tasa);
                    oferta.setEstado(estadoFinal);
                }

                ofertaRepository.save(oferta);
                campaniasAfectadas.add(campania.getId());
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

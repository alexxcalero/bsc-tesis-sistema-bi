package pe.com.banco.bi.module2.common.importer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.catalog.entity.*;
import pe.com.banco.bi.catalog.repository.*;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ClienteImporter implements CargaDataImporter {

    private final ClienteRepository clienteRepository;
    private final TipoDocumentoRepository tipoDocumentoRepository;
    private final SegmentoRepository segmentoRepository;
    private final ZonaRepository zonaRepository;
    private final AgenciaRepository agenciaRepository;
    private final CanalRepository canalRepository;
    private final TipoClienteRepository tipoClienteRepository;

    @Override
    public boolean soporta(String tipoCargaCodigo) {
        return "CLIENTES".equalsIgnoreCase(tipoCargaCodigo);
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
                String tipoDocumentoCodigo = cols[0].trim();
                String numeroDocumento = cols[1].trim();
                String primerNombre = cols[2].trim();
                String segundoNombre = cols.length > 3 ? cols[3].trim() : null;
                String apellidoPaterno = cols[4].trim();
                String apellidoMaterno = cols.length > 5 ? cols[5].trim() : null;
                String correo = cols.length > 6 ? cols[6].trim() : null;
                String telefono = cols.length > 7 ? cols[7].trim() : null;
                String segmentoCodigo = cols.length > 8 ? cols[8].trim() : null;
                String zonaCodigo = cols.length > 9 ? cols[9].trim() : null;
                String agenciaCodigo = cols.length > 10 ? cols[10].trim() : null;
                String canalCodigo = cols.length > 11 ? cols[11].trim() : null;
                String tipoClienteCodigo = cols.length > 12 ? cols[12].trim() : null;

                TipoDocumento tipoDocumento = tipoDocumentoRepository.findByCodigo(tipoDocumentoCodigo)
                        .orElseThrow(() -> new RuntimeException("Tipo de documento no encontrado: " + tipoDocumentoCodigo));

                Optional<Segmento> segmento = buscarCatalogo(segmentoCodigo, segmentoRepository::findByCodigo);
                Optional<Zona> zona = buscarCatalogo(zonaCodigo, zonaRepository::findByCodigo);
                Optional<Agencia> agencia = buscarCatalogo(agenciaCodigo, agenciaRepository::findByCodigo);
                Optional<Canal> canal = buscarCatalogo(canalCodigo, canalRepository::findByCodigo);
                Optional<TipoCliente> tipoCliente = buscarCatalogo(tipoClienteCodigo, tipoClienteRepository::findByCodigo);

                Cliente cliente = clienteRepository.findByNumeroDocumento(numeroDocumento)
                        .map(existing -> {
                            existing.setTipoDocumento(tipoDocumento);
                            existing.setPrimerNombre(primerNombre);
                            existing.setSegundoNombre(segundoNombre);
                            existing.setApellidoPaterno(apellidoPaterno);
                            existing.setApellidoMaterno(apellidoMaterno);
                            existing.setCorreo(correo);
                            existing.setTelefono(telefono);
                            existing.setSegmento(segmento.orElse(null));
                            existing.setZona(zona.orElse(null));
                            existing.setAgencia(agencia.orElse(null));
                            existing.setCanal(canal.orElse(null));
                            existing.setTipoCliente(tipoCliente.orElse(null));
                            return existing;
                        })
                        .orElseGet(() -> Cliente.builder()
                                .tipoDocumento(tipoDocumento)
                                .numeroDocumento(numeroDocumento)
                                .primerNombre(primerNombre)
                                .segundoNombre(segundoNombre)
                                .apellidoPaterno(apellidoPaterno)
                                .apellidoMaterno(apellidoMaterno)
                                .correo(correo)
                                .telefono(telefono)
                                .segmento(segmento.orElse(null))
                                .zona(zona.orElse(null))
                                .agencia(agencia.orElse(null))
                                .canal(canal.orElse(null))
                                .tipoCliente(tipoCliente.orElse(null))
                                .build());

                clienteRepository.save(cliente);
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

    private <T> Optional<T> buscarCatalogo(String codigo, java.util.function.Function<String, Optional<T>> finder) {
        return (codigo == null || codigo.isBlank() || "N/A".equalsIgnoreCase(codigo))
                ? Optional.empty()
                : finder.apply(codigo);
    }
}

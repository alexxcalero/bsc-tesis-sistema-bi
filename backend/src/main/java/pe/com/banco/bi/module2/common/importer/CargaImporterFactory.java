package pe.com.banco.bi.module2.common.importer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CargaImporterFactory {

    private final List<CargaDataImporter> importers;

    public CargaDataImporter resolver(String tipoCargaCodigo) {
        return importers.stream()
                .filter(i -> i.soporta(tipoCargaCodigo))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Tipo de carga no soportado para importación: " + tipoCargaCodigo));
    }
}

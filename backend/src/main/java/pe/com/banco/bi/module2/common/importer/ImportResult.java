package pe.com.banco.bi.module2.common.importer;

import lombok.Builder;
import lombok.Getter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Builder
public class ImportResult {

    private final int totalFilas;
    private final int filasProcesadas;
    private final List<ImportError> errores;
    private final Set<Long> campaniasAfectadas;

    public static ImportResult vacio() {
        return ImportResult.builder()
                .totalFilas(0)
                .filasProcesadas(0)
                .errores(new ArrayList<>())
                .campaniasAfectadas(new HashSet<>())
                .build();
    }
}

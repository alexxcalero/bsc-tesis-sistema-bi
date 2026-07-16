package pe.com.banco.bi.module2.common.importer;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ImportError {

    private final int numeroFila;
    private final String campo;
    private final String tipoError;
    private final String mensajeError;
}

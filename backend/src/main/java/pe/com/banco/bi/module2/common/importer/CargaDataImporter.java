package pe.com.banco.bi.module2.common.importer;

import java.util.List;

public interface CargaDataImporter {

    boolean soporta(String tipoCargaCodigo);

    ImportResult importar(Long procesoCargaId, List<String[]> filas);
}

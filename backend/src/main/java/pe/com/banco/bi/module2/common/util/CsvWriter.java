package pe.com.banco.bi.module2.common.util;

import java.util.List;

public class CsvWriter {

    private final StringBuilder sb = new StringBuilder();

    public CsvWriter addRow(String... values) {
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                sb.append(",");
            }
            sb.append(escapar(values[i]));
        }
        sb.append("\n");
        return this;
    }

    public CsvWriter addRow(List<String> values) {
        return addRow(values.toArray(new String[0]));
    }

    private String escapar(String valor) {
        if (valor == null) {
            return "";
        }
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n") || valor.contains("\r")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    public String build() {
        return sb.toString();
    }
}

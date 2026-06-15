package pe.com.banco.bi.module1.reporte.dto;

import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteFiltroRequest {

    @Builder.Default
    private Map<String, String> filtros = new HashMap<>();
}

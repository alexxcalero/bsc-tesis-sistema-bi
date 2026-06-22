package pe.com.banco.bi.module1.campania.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaniaResumenResponse {

    private Long total;
    private Long activas;
}

package pe.com.banco.bi.module1.dashboard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SerieData {

    private String label;
    private Double valor;
}

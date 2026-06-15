package pe.com.banco.bi.module1.cliente.dto;

import lombok.*;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.oferta.dto.OfertaResponse;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente360Response {

    private ClienteResponse cliente;
    private List<CampaniaResponse> campanias;
    private List<OfertaResponse> ofertas;
}

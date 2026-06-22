package pe.com.banco.bi.module2.procesocarga.dto;

public record ProcesoCargaTotales(
        Long totalRegistros,
        Long totalRegValidos,
        Long totalRegInvalidos
) {
}

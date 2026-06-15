package pe.com.banco.bi.module2.errorcarga.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

@Entity
@Table(name = "errores_carga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_fila", nullable = false)
    private Integer numeroFila;

    @Column(length = 100)
    private String campo;

    @Column(name = "mensaje_error", nullable = false, length = 500)
    private String mensajeError;

    @Column(name = "tipo_error", nullable = false, length = 50)
    private String tipoError;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_carga_id", nullable = false)
    private ProcesoCarga procesoCarga;
}

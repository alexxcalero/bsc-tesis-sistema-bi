package pe.com.banco.bi.module2.detallecarga.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

@Entity
@Table(name = "detalles_carga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_fila", nullable = false)
    private Integer numeroFila;

    @Column(name = "datos_fila", nullable = false, columnDefinition = "TEXT")
    private String datosFila;

    @Column(name = "es_valido", nullable = false)
    private Boolean esValido;

    @Column(length = 500)
    private String observaciones;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proceso_carga_id", nullable = false)
    private ProcesoCarga procesoCarga;
}

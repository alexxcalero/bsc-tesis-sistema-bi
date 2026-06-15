package pe.com.banco.bi.module2.resultadocarga.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

@Entity
@Table(name = "resultados_carga")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_registros", nullable = false)
    private Integer totalRegistros;

    @Column(name = "total_registros_validos", nullable = false)
    private Integer totalRegistrosValidos;

    @Column(name = "total_registros_invalidos", nullable = false)
    private Integer totalRegistrosInvalidos;

    @Column(name = "total_registros_procesados", nullable = false)
    private Integer totalRegistrosProcesados;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proceso_carga_id", nullable = false)
    private ProcesoCarga procesoCarga;
}

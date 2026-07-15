package pe.com.banco.bi.module1.reporte.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reporte_filtros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteFiltro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporte_id", nullable = false)
    private Reporte reporte;

    @Column(nullable = false, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(name = "catalogo_endpoint", length = 100)
    private String catalogoEndpoint;

    @Column(nullable = false)
    private Integer orden = 0;
}

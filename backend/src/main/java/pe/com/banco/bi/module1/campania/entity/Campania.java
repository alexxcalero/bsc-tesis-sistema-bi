package pe.com.banco.bi.module1.campania.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pe.com.banco.bi.catalog.entity.Periodo;
import pe.com.banco.bi.catalog.entity.Producto;
import pe.com.banco.bi.catalog.entity.Subproducto;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "campanias")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campania {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @Column(nullable = false, length = 50)
    private String estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "periodo_id")
    private Periodo periodo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subproducto_id")
    private Subproducto subproducto;

    @Builder.Default
    @Column(name = "clientes_alcanzados", nullable = false)
    private Integer clientesAlcanzados = 0;

    @Builder.Default
    @Column(name = "monto_ofertado", nullable = false, precision = 18, scale = 2)
    private BigDecimal montoOfertado = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "ticket_promedio", nullable = false, precision = 18, scale = 2)
    private BigDecimal ticketPromedio = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proceso_carga_id")
    private ProcesoCarga procesoCarga;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

package pe.com.banco.bi.module2.procesocarga.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pe.com.banco.bi.catalog.entity.EstadoCarga;
import pe.com.banco.bi.catalog.entity.TipoCarga;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.time.LocalDateTime;

@Entity
@Table(name = "procesos_carga", indexes = {
        @Index(name = "idx_proceso_carga_codigo", columnList = "codigo")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcesoCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "total_registros", nullable = false)
    private Integer totalRegistros;

    @Column(name = "total_reg_validos", nullable = false)
    private Integer totalRegValidos;

    @Column(name = "total_reg_invalidos", nullable = false)
    private Integer totalRegInvalidos;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_carga_id", nullable = false)
    private TipoCarga tipoCarga;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "estado_carga_id", nullable = false)
    private EstadoCarga estadoCarga;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

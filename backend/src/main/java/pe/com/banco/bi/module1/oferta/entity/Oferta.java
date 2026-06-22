package pe.com.banco.bi.module1.oferta.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import pe.com.banco.bi.module1.campania.entity.Campania;
import pe.com.banco.bi.module1.cliente.entity.Cliente;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ofertas", indexes = {
        @Index(name = "idx_oferta_campania_id", columnList = "campania_id"),
        @Index(name = "idx_oferta_cliente_id", columnList = "cliente_id"),
        @Index(name = "idx_oferta_campania_cliente", columnList = "campania_id,cliente_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal monto;

    @Column(precision = 5, scale = 2)
    private BigDecimal tasa;

    @Column(name = "fecha_oferta", nullable = false)
    private LocalDate fechaOferta;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(length = 500)
    private String observacion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campania_id", nullable = false)
    private Campania campania;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

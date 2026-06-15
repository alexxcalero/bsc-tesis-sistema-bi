package pe.com.banco.bi.catalog.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "canales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Canal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo;
}

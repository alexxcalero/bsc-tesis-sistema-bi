package pe.com.banco.bi.securitydomain.usuario.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.com.banco.bi.securitydomain.rol.entity.Rol;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String primerNombre;

    @Column(length = 100)
    private String segundoNombre;

    @Column(nullable = false, length = 100)
    private String apellidoPaterno;

    @Column(length = 100)
    private String apellidoMaterno;

    @Column(nullable = false, unique = true, length = 150)
    private String correo;

    @Column(nullable = false)
    private Boolean estado;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Rol rol;
}

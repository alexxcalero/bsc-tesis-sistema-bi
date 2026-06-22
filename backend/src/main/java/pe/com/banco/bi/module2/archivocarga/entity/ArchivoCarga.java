package pe.com.banco.bi.module2.archivocarga.entity;

import jakarta.persistence.*;
import lombok.*;
import pe.com.banco.bi.module2.procesocarga.entity.ProcesoCarga;

@Entity
@Table(name = "archivos_carga", indexes = {
        @Index(name = "idx_archivo_carga_proceso_carga_id", columnList = "proceso_carga_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchivoCarga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @Column(name = "tipo_archivo", nullable = false, length = 100)
    private String tipoArchivo;

    @Column(name = "tamano_archivo", nullable = false)
    private Long tamanoArchivo;

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proceso_carga_id", nullable = false)
    private ProcesoCarga procesoCarga;
}

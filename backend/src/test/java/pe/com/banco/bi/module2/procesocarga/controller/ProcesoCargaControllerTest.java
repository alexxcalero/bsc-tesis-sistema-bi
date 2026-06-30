package pe.com.banco.bi.module2.procesocarga.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.com.banco.bi.module2.procesocarga.service.ProcesoCargaService;
import pe.com.banco.bi.security.CustomUserDetails;
import pe.com.banco.bi.security.JwtUtil;
import pe.com.banco.bi.security.SecurityConfig;
import pe.com.banco.bi.security.UserDetailsServiceImpl;
import pe.com.banco.bi.securitydomain.permiso.entity.Permiso;
import pe.com.banco.bi.securitydomain.rol.entity.Rol;
import pe.com.banco.bi.securitydomain.usuario.entity.Usuario;

import java.util.Set;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProcesoCargaController.class)
@Import(SecurityConfig.class)
class ProcesoCargaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProcesoCargaService procesoCargaService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    private CustomUserDetails usuarioConPermiso(String... permisos) {
        Set<Permiso> permisosSet = new java.util.HashSet<>();
        long id = 1L;
        for (String codigo : permisos) {
            permisosSet.add(Permiso.builder().id(id++).codigo(codigo).nombre(codigo).build());
        }
        Rol rol = Rol.builder().id(1L).codigo("ESPECIALISTA").nombre("Especialista").permisos(permisosSet).build();
        Usuario usuario = Usuario.builder()
                .id(1L)
                .username("especialista")
                .passwordHash("pass")
                .primerNombre("Esp")
                .apellidoPaterno("Prueba")
                .correo("esp@prueba.com")
                .estado(true)
                .rol(rol)
                .build();
        return new CustomUserDetails(usuario);
    }

    @Test
    void registrar_conPermiso_debeRetornar200() throws Exception {
        MockMultipartFile archivo = new MockMultipartFile("archivo", "campanias_validas.csv", "text/csv", "codigo,nombre\nC1,N1\n".getBytes());
        MockMultipartFile datos = new MockMultipartFile("datos", "", "application/json", "{\"tipoCargaId\": 1, \"observacion\": \"Prueba\"}".getBytes());

        mockMvc.perform(multipart("/api/v1/cargas")
                        .file(archivo)
                        .file(datos)
                        .with(csrf())
                        .with(user(usuarioConPermiso("CARGAS_CREAR"))))
                .andExpect(status().isOk());
    }

    @Test
    void publicar_sinPermisoPublicar_debeRetornar403() throws Exception {
        mockMvc.perform(post("/api/v1/cargas/1/publicar")
                        .with(csrf())
                        .with(user(usuarioConPermiso("CARGAS_VER")))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}

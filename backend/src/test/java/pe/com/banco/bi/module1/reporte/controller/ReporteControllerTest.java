package pe.com.banco.bi.module1.reporte.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.com.banco.bi.module1.reporte.service.ReporteService;

import java.util.Map;
import pe.com.banco.bi.security.JwtUtil;
import pe.com.banco.bi.security.SecurityConfig;
import pe.com.banco.bi.security.UserDetailsServiceImpl;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReporteController.class)
@Import(SecurityConfig.class)
class ReporteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReporteService reporteService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(authorities = "REPORTES_CREAR")
    void generar_conPermiso_debeRetornarCsv() throws Exception {
        String csvContent = "Codigo,Nombre\nCAMP-001,Prueba\n";
        when(reporteService.generarReporte(eq("campanias"), any(Map.class)))
                .thenReturn(new ByteArrayInputStream(csvContent.getBytes(StandardCharsets.UTF_8)));

        mockMvc.perform(post("/api/v1/reportes/CAMPANIAS/generar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"filtros\":{\"periodoIds\":\"1\"}}"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment")));
    }

    @Test
    @WithMockUser(authorities = "REPORTES_VER")
    void generar_sinPermisoCrear_debeRetornar403() throws Exception {
        mockMvc.perform(post("/api/v1/reportes/CAMPANIAS/generar")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isForbidden());
    }
}

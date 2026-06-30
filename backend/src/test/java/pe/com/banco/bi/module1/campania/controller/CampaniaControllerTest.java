package pe.com.banco.bi.module1.campania.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import pe.com.banco.bi.module1.campania.dto.CampaniaResumenResponse;
import pe.com.banco.bi.module1.campania.dto.CampaniaResponse;
import pe.com.banco.bi.module1.campania.service.CampaniaService;
import pe.com.banco.bi.security.JwtUtil;
import pe.com.banco.bi.security.SecurityConfig;
import pe.com.banco.bi.security.UserDetailsServiceImpl;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CampaniaController.class)
@Import(SecurityConfig.class)
class CampaniaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CampaniaService campaniaService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    @WithMockUser(authorities = "CAMPANIAS_VER")
    void listar_conPermiso_debeRetornar200() throws Exception {
        when(campaniaService.listarCampanias(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(CampaniaResponse.builder().id(1L).codigo("CAMP-001").build())));

        mockMvc.perform(get("/api/v1/campanias"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(authorities = "CLIENTES_VER")
    void listar_sinPermiso_debeRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/campanias"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "CAMPANIAS_VER")
    void resumen_conPermiso_debeRetornar200() throws Exception {
        when(campaniaService.resumenCampanias(any(), any(), any(), any(), any()))
                .thenReturn(CampaniaResumenResponse.builder().total(5L).activas(3L).build());

        mockMvc.perform(get("/api/v1/campanias/resumen"))
                .andExpect(status().isOk());
    }
}

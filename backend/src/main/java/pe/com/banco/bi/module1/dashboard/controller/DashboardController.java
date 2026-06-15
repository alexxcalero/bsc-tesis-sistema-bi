package pe.com.banco.bi.module1.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.com.banco.bi.module1.dashboard.dto.DashboardResponse;
import pe.com.banco.bi.module1.dashboard.service.DashboardService;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyAuthority('CAMPANIAS_VER', 'CLIENTES_VER', 'REPORTES_VER')")
    public ResponseEntity<DashboardResponse> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerDashboard());
    }
}

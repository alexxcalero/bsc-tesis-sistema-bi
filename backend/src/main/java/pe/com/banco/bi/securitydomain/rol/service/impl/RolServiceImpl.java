package pe.com.banco.bi.securitydomain.rol.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.com.banco.bi.securitydomain.rol.dto.RolResponse;
import pe.com.banco.bi.securitydomain.rol.mapper.RolMapper;
import pe.com.banco.bi.securitydomain.rol.repository.RolRepository;
import pe.com.banco.bi.securitydomain.rol.service.RolService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;
    private final RolMapper rolMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RolResponse> listarRoles() {
        return rolRepository.findAll().stream()
                .map(rolMapper::toResponse)
                .toList();
    }
}

package pe.com.banco.bi.module1.cliente.service.impl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.com.banco.bi.module1.campania.mapper.CampaniaMapper;
import pe.com.banco.bi.module1.campania.repository.CampaniaRepository;
import pe.com.banco.bi.module1.cliente.dto.Cliente360Response;
import pe.com.banco.bi.module1.cliente.dto.ClienteResponse;
import pe.com.banco.bi.module1.cliente.entity.Cliente;
import pe.com.banco.bi.module1.cliente.mapper.ClienteMapper;
import pe.com.banco.bi.module1.cliente.repository.ClienteRepository;
import pe.com.banco.bi.module1.oferta.mapper.OfertaMapper;
import pe.com.banco.bi.module1.oferta.repository.OfertaRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClienteServiceImplTest {

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private CampaniaRepository campaniaRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private ClienteMapper clienteMapper;

    @Mock
    private CampaniaMapper campaniaMapper;

    @Mock
    private OfertaMapper ofertaMapper;

    @InjectMocks
    private ClienteServiceImpl clienteService;

    @Test
    void obtenerCliente360_debeRetornarDatosDelCliente() {
        Cliente cliente = Cliente.builder()
                .id(1L)
                .primerNombre("Juan")
                .apellidoPaterno("Pérez")
                .numeroDocumento("12345678")
                .build();

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(clienteMapper.toResponse(any(Cliente.class))).thenAnswer(invocation -> {
            Cliente c = invocation.getArgument(0);
            return ClienteResponse.builder()
                    .id(c.getId())
                    .primerNombre(c.getPrimerNombre())
                    .apellidoPaterno(c.getApellidoPaterno())
                    .numeroDocumento(c.getNumeroDocumento())
                    .build();
        });

        Cliente360Response resultado = clienteService.obtenerCliente360(1L);

        assertThat(resultado.getCliente()).isNotNull();
        assertThat(resultado.getCliente().getNumeroDocumento()).isEqualTo("12345678");
        assertThat(resultado.getCliente().getPrimerNombre()).isEqualTo("Juan");
    }
}

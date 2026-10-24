package br.com.motivafit.service;

import br.com.motivafit.dto.request.UsuarioRequestDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.repository.UsuarioRepository;
import br.com.motivafit.dto.mapper.UsuarioMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UsuarioServiceTest {
    private UsuarioRepository repository;
    private UsuarioService service;

    @BeforeEach
    void setup() {
        repository = mock(UsuarioRepository.class);
        UsuarioMapper mapper = new UsuarioMapper(mock(PasswordEncoder.class));
        service = new UsuarioService(repository, mapper);
    }

    @Test
    void criaUsuarioEMapeiaResposta() {
        when(repository.existsByEmail("novo@test.com")).thenReturn(false);
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario saved = invocation.getArgument(0);
            saved.setEmail("novo@test.com");
            return saved;
        });

        var response = service.create(new UsuarioRequestDTO("novo@test.com", "senha"));

        assertEquals("novo@test.com", response.email());
        assertEquals(Perfil.USUARIO, response.perfil());
        assertTrue(response.ativo());
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void emailDuplicadoGeraConflitoSemSalvar() {
        when(repository.existsByEmail("existente@test.com")).thenReturn(true);

        assertThrows(ConflitoException.class,
                () -> service.create(new UsuarioRequestDTO("existente@test.com", "senha")));
        verify(repository, never()).save(any());
    }
}

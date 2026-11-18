package br.com.motivafit.bootstrap;

import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SuperusuarioBootstrapTest {
    private UsuarioRepository repository;
    private PasswordEncoder passwordEncoder;
    private SuperusuarioBootstrap bootstrap;

    @BeforeEach
    void setUp() {
        repository = mock(UsuarioRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        bootstrap = new SuperusuarioBootstrap(repository, passwordEncoder);
        ReflectionTestUtils.setField(bootstrap, "adminEmail", "root@motivafit.com");
        ReflectionTestUtils.setField(bootstrap, "adminSenhaTemporaria", "senha-temporaria");
    }

    @Test
    void criaSuperusuarioComSenhaCodificadaQuandoAindaNaoExiste() {
        when(repository.findByEmail("root@motivafit.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha-temporaria")).thenReturn("senha-hash");
        when(repository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bootstrap.run();

        var captor = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(repository).save(captor.capture());
        Usuario criado = captor.getValue();
        assertEquals("root@motivafit.com", criado.getEmail());
        assertEquals("senha-hash", criado.getSenhaHash());
        assertEquals(Perfil.SUPERUSUARIO, criado.getPerfil());
        assertEquals(true, criado.getAtivo());
    }

    @Test
    void usuarioExistenteSuperusuarioNaoEhAlteradoNemSalvo() {
        Usuario existente = usuario(Perfil.SUPERUSUARIO);
        when(repository.findByEmail("root@motivafit.com")).thenReturn(Optional.of(existente));

        bootstrap.run();

        verify(repository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void emailExistenteComOutroPerfilNaoEhPromovido() {
        Usuario existente = usuario(Perfil.USUARIO);
        when(repository.findByEmail("root@motivafit.com")).thenReturn(Optional.of(existente));

        bootstrap.run();

        assertEquals(Perfil.USUARIO, existente.getPerfil());
        verify(repository, never()).save(any());
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void credenciaisAusentesImpedemConsultaAoRepositorio() {
        ReflectionTestUtils.setField(bootstrap, "adminEmail", " ");

        bootstrap.run();

        verifyNoInteractions(repository, passwordEncoder);
    }

    @Test
    void senhaTemporariaAusenteTambemImpedeConsultaAoRepositorio() {
        ReflectionTestUtils.setField(bootstrap, "adminSenhaTemporaria", "");

        bootstrap.run();

        verifyNoInteractions(repository, passwordEncoder);
    }

    private Usuario usuario(Perfil perfil) {
        Usuario usuario = new Usuario();
        usuario.setEmail("root@motivafit.com");
        usuario.setPerfil(perfil);
        return usuario;
    }
}

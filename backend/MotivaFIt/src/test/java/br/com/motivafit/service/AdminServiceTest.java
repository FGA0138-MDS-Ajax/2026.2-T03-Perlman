package br.com.motivafit.service;

import br.com.motivafit.dto.request.AceitarConviteRequestDTO;
import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.entity.ConviteAdmin;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Estado;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.ConviteAdminRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminServiceTest {
    private static final String TOKEN = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG";
    private UsuarioRepository usuarioRepository;
    private ConviteAdminRepository conviteRepository;
    private AdminService service;

    @BeforeEach
    void setUp() {
        usuarioRepository = mock(UsuarioRepository.class);
        conviteRepository = mock(ConviteAdminRepository.class);
        service = new AdminService(usuarioRepository, conviteRepository);
    }

    @Test
    void criaConviteComTokenSeguroEExpiracaoEmSeteDias() {
        Usuario convidador = usuario("admin@motivafit.com");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(convidador));
        when(conviteRepository.findPendentePorEmail("convidado@motivafit.com")).thenReturn(Optional.empty());
        when(conviteRepository.save(any(ConviteAdmin.class))).thenAnswer(invocation -> {
            ConviteAdmin convite = invocation.getArgument(0);
            ReflectionTestUtils.setField(convite, "id", 10L);
            return convite;
        });

        var response = service.criarConvite(new ConviteAdminRequestDTO(1L, "convidado@motivafit.com"));

        assertEquals(10L, response.id());
        assertEquals(43, response.token().length());
        assertEquals(Estado.PENDENTE, capturarSalvo().getEstado());
        assertEquals(64, capturarSalvo().getTokenHash().length());
        long segundosRestantes = java.time.Duration.between(Instant.now(), response.expiraEm()).toSeconds();
        assertTrue(segundosRestantes > 604_790 && segundosRestantes <= 604_800);
    }

    @Test
    void usuarioConvidadorInexistenteGeraNaoEncontrado() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class,
                () -> service.criarConvite(new ConviteAdminRequestDTO(1L, "convidado@motivafit.com")));
        verifyNoInteractions(conviteRepository);
    }

    @Test
    void convitePendenteAindaValidoGeraConflito() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario("admin@motivafit.com")));
        when(conviteRepository.findPendentePorEmail(anyString())).thenReturn(Optional.of(convite(Instant.now().plusSeconds(600))));

        assertThrows(ConflitoException.class,
                () -> service.criarConvite(new ConviteAdminRequestDTO(1L, "convidado@motivafit.com")));
        verify(conviteRepository, never()).save(any());
    }

    @Test
    void convitePendenteExpiradoEhExpiradoAntesDeCriarOutro() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario("admin@motivafit.com")));
        ConviteAdmin expirado = convite(Instant.now().minusSeconds(600));
        when(conviteRepository.findPendentePorEmail(anyString())).thenReturn(Optional.of(expirado));
        when(conviteRepository.save(any(ConviteAdmin.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertDoesNotThrow(() -> service.criarConvite(new ConviteAdminRequestDTO(1L, "convidado@motivafit.com")));

        assertEquals(Estado.EXPIRADO, expirado.getEstado());
        verify(conviteRepository).flush();
        verify(conviteRepository).save(any(ConviteAdmin.class));
    }

    @Test
    void aceitaConviteEPromoveUsuario() {
        Usuario usuario = usuario("convidado@motivafit.com");
        ConviteAdmin convite = convite(Instant.now().plusSeconds(600));
        convite.setEmail("convidado@motivafit.com");
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario));
        when(conviteRepository.findByTokenHash(anyString())).thenReturn(Optional.of(convite));

        service.aceitarConvite(new AceitarConviteRequestDTO(2L, TOKEN));

        assertEquals(Perfil.ADMINISTRADOR, usuario.getPerfil());
        assertEquals(Estado.ACEITO, convite.getEstado());
    }

    @Test
    void aceitarConviteComUsuarioInexistenteGeraNaoEncontrado() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class,
                () -> service.aceitarConvite(new AceitarConviteRequestDTO(2L, TOKEN)));
        verifyNoInteractions(conviteRepository);
    }

    @Test
    void tokenDesconhecidoGeraConviteInvalido() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario("convidado@motivafit.com")));
        when(conviteRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class,
                () -> service.aceitarConvite(new AceitarConviteRequestDTO(2L, TOKEN)));

        assertEquals("CONVITE_INVALIDO", erro.getCodigo());
    }

    @Test
    void conviteExpiradoEhApresentadoComoInvalido() {
        Usuario usuario = usuario("outra@motivafit.com");
        ConviteAdmin convite = convite(Instant.now().minusSeconds(600));
        convite.setEmail("convidado@motivafit.com");
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario));
        when(conviteRepository.findByTokenHash(anyString())).thenReturn(Optional.of(convite));

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class,
                () -> service.aceitarConvite(new AceitarConviteRequestDTO(2L, TOKEN)));

        assertEquals("CONVITE_INVALIDO", erro.getCodigo());
        assertEquals(Perfil.USUARIO, usuario.getPerfil());
    }

    @Test
    void conviteParaEmailDiferenteEhRejeitado() {
        Usuario usuario = usuario("outra@motivafit.com");
        ConviteAdmin convite = convite(Instant.now().plusSeconds(600));
        convite.setEmail("convidado@motivafit.com");
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuario));
        when(conviteRepository.findByTokenHash(anyString())).thenReturn(Optional.of(convite));

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class,
                () -> service.aceitarConvite(new AceitarConviteRequestDTO(2L, TOKEN)));

        assertEquals("EMAIL_NAO_CORRESPONDE_CONVITE", erro.getCodigo());
        assertEquals(Perfil.USUARIO, usuario.getPerfil());
        assertEquals(Estado.PENDENTE, convite.getEstado());
    }

    private ConviteAdmin capturarSalvo() {
        var captor = org.mockito.ArgumentCaptor.forClass(ConviteAdmin.class);
        verify(conviteRepository, atLeastOnce()).save(captor.capture());
        return captor.getValue();
    }

    private Usuario usuario(String email) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setPerfil(Perfil.USUARIO);
        usuario.setAtivo(true);
        return usuario;
    }

    private ConviteAdmin convite(Instant expiraEm) {
        ConviteAdmin convite = new ConviteAdmin();
        convite.setEstado(Estado.PENDENTE);
        convite.setExpiraEm(expiraEm);
        return convite;
    }
}

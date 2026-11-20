package br.com.motivafit.service;

import br.com.motivafit.dto.request.AmizadeRequestDTO;
import br.com.motivafit.dto.request.AmizadeUpdateRequestDTO;
import br.com.motivafit.dto.response.AmizadeResponseDTO;
import br.com.motivafit.entity.Amizade;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoAmizade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.AmizadeRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AmizadeServiceTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long OUTRO_USUARIO_ID = 15L;
    private static final Long AMIZADE_ID = 1L;

    private AmizadeRepository amizadeRepository;
    private UsuarioRepository usuarioRepository;
    private AmizadeService service;

    @BeforeEach
    void setup() {
        amizadeRepository = mock(AmizadeRepository.class);
        usuarioRepository = mock(UsuarioRepository.class);
        service = new AmizadeService(amizadeRepository, usuarioRepository);
    }

    // --- findAll ---

    @Test
    void listaAmizadesAtivasDoUsuario() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.ACEITA);
        when(amizadeRepository.findAtivasDoUsuario(USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(List.of(amizade));
        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "solicitante@teste.com"),
                        usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));

        List<AmizadeResponseDTO> resultado = service.findAll(USUARIO_ID);

        assertEquals(1, resultado.size());
        assertEquals(AMIZADE_ID, resultado.get(0).id());
        assertEquals(USUARIO_ID, resultado.get(0).solicitanteId());
        assertEquals("solicitante@teste.com", resultado.get(0).solicitanteEmail());
        assertEquals(OUTRO_USUARIO_ID, resultado.get(0).destinatarioId());
        assertEquals("destinatario@teste.com", resultado.get(0).destinatarioEmail());
        assertEquals(EstadoAmizade.ACEITA, resultado.get(0).estado());
    }

    @Test
    void listaVaziaQuandoNaoHaAmizades() {
        when(amizadeRepository.findAtivasDoUsuario(USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(List.of());

        List<AmizadeResponseDTO> resultado = service.findAll(USUARIO_ID);

        assertTrue(resultado.isEmpty());
        verify(usuarioRepository, never()).findAllById(anyList());
    }

    @Test
    void naoListaAmizadesRecusadas() {
        when(amizadeRepository.findAtivasDoUsuario(USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(List.of());

        List<AmizadeResponseDTO> resultado = service.findAll(USUARIO_ID);

        assertTrue(resultado.isEmpty());
    }

    // --- create ---

    @Test
    void enviaSolicitacaoDeAmizade() {
        when(usuarioRepository.findById(OUTRO_USUARIO_ID))
                .thenReturn(Optional.of(usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));
        when(amizadeRepository.findEntreUsuarios(USUARIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(List.of());
        when(amizadeRepository.save(any(Amizade.class))).thenAnswer(invocation -> {
            Amizade salvo = invocation.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id", AMIZADE_ID);
            ReflectionTestUtils.setField(salvo, "criadoEm", OffsetDateTime.now());
            return salvo;
        });
        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "solicitante@teste.com"),
                        usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));

        AmizadeResponseDTO resultado = service.create(USUARIO_ID,
                new AmizadeRequestDTO(OUTRO_USUARIO_ID));

        assertEquals(AMIZADE_ID, resultado.id());
        assertEquals(USUARIO_ID, resultado.solicitanteId());
        assertEquals(OUTRO_USUARIO_ID, resultado.destinatarioId());
        assertEquals(EstadoAmizade.PENDENTE, resultado.estado());

        ArgumentCaptor<Amizade> captor = ArgumentCaptor.forClass(Amizade.class);
        verify(amizadeRepository).save(captor.capture());
        assertEquals(USUARIO_ID, captor.getValue().getSolicitanteId());
        assertEquals(OUTRO_USUARIO_ID, captor.getValue().getDestinatarioId());
    }

    @Test
    void naoPodeEnviarAmizadeParaSiMesmo() {
        ConflitoException erro = assertThrows(ConflitoException.class,
                () -> service.create(USUARIO_ID, new AmizadeRequestDTO(USUARIO_ID)));

        assertEquals("NAO_SE_AUTO_CONVIDAR", erro.getCodigo());
        assertEquals(HttpStatus.CONFLICT, erro.getStatus());
        verify(amizadeRepository, never()).save(any());
    }

    @Test
    void destinatarioInexistenteGeraNaoEncontrado() {
        when(usuarioRepository.findById(OUTRO_USUARIO_ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.create(USUARIO_ID, new AmizadeRequestDTO(OUTRO_USUARIO_ID)));

        assertEquals("USUARIO_NAO_ENCONTRADO", erro.getCodigo());
        verify(amizadeRepository, never()).save(any());
    }

    @Test
    void solicitacaoExistenteGeraConflito() {
        when(usuarioRepository.findById(OUTRO_USUARIO_ID))
                .thenReturn(Optional.of(usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));
        when(amizadeRepository.findEntreUsuarios(USUARIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(List.of(amizade(99L, OUTRO_USUARIO_ID, USUARIO_ID, EstadoAmizade.PENDENTE)));

        ConflitoException erro = assertThrows(ConflitoException.class,
                () -> service.create(USUARIO_ID, new AmizadeRequestDTO(OUTRO_USUARIO_ID)));

        assertEquals("AMIZADE_JA_EXISTE", erro.getCodigo());
        verify(amizadeRepository, never()).save(any());
    }

    @Test
    void podeReenviarSolicitacaoDepoisDeRecusada() {
        when(usuarioRepository.findById(OUTRO_USUARIO_ID))
                .thenReturn(Optional.of(usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));
        when(amizadeRepository.findEntreUsuarios(USUARIO_ID, OUTRO_USUARIO_ID))
                .thenReturn(List.of(amizade(99L, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA)));
        when(amizadeRepository.save(any(Amizade.class))).thenAnswer(invocation -> {
            Amizade salvo = invocation.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id", AMIZADE_ID);
            ReflectionTestUtils.setField(salvo, "criadoEm", OffsetDateTime.now());
            return salvo;
        });
        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "solicitante@teste.com"),
                        usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));

        AmizadeResponseDTO resultado = service.create(USUARIO_ID,
                new AmizadeRequestDTO(OUTRO_USUARIO_ID));

        assertEquals(EstadoAmizade.PENDENTE, resultado.estado());
        verify(amizadeRepository).save(any());
    }

    // --- update ---

    @Test
    void destinatarioAceitaSolicitacao() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.PENDENTE);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));
        when(amizadeRepository.save(any(Amizade.class))).thenAnswer(invocation -> {
            Amizade salvo = invocation.getArgument(0);
            ReflectionTestUtils.setField(salvo, "atualizadoEm", OffsetDateTime.now());
            return salvo;
        });
        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "solicitante@teste.com"),
                        usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));

        AmizadeResponseDTO resultado = service.update(OUTRO_USUARIO_ID, AMIZADE_ID,
                new AmizadeUpdateRequestDTO(EstadoAmizade.ACEITA));

        assertEquals(EstadoAmizade.ACEITA, resultado.estado());
        assertNotNull(resultado.atualizadoEm());

        ArgumentCaptor<Amizade> captor = ArgumentCaptor.forClass(Amizade.class);
        verify(amizadeRepository).save(captor.capture());
        assertEquals(EstadoAmizade.ACEITA, captor.getValue().getEstado());
    }

    @Test
    void destinatarioRecusaSolicitacao() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.PENDENTE);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));
        when(amizadeRepository.save(any(Amizade.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(usuarioRepository.findAllById(List.of(USUARIO_ID, OUTRO_USUARIO_ID)))
                .thenReturn(List.of(usuario(USUARIO_ID, "solicitante@teste.com"),
                        usuario(OUTRO_USUARIO_ID, "destinatario@teste.com")));

        AmizadeResponseDTO resultado = service.update(OUTRO_USUARIO_ID, AMIZADE_ID,
                new AmizadeUpdateRequestDTO(EstadoAmizade.RECUSADA));

        assertEquals(EstadoAmizade.RECUSADA, resultado.estado());
    }

    @Test
    void amizadeInexistenteGeraNaoEncontrado() {
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.update(OUTRO_USUARIO_ID, AMIZADE_ID,
                        new AmizadeUpdateRequestDTO(EstadoAmizade.ACEITA)));

        assertEquals("AMIZADE_NAO_ENCONTRADA", erro.getCodigo());
    }

    @Test
    void somenteDestinatarioPodeResponder() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.PENDENTE);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class,
                () -> service.update(USUARIO_ID, AMIZADE_ID,
                        new AmizadeUpdateRequestDTO(EstadoAmizade.ACEITA)));

        assertEquals("SOMENTE_DESTINATARIO", erro.getCodigo());
    }

    @Test
    void solicitacaoJaRespondidaNaoPodeSerAtualizada() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.ACEITA);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));

        RequisicaoInvalidaException erro = assertThrows(RequisicaoInvalidaException.class,
                () -> service.update(OUTRO_USUARIO_ID, AMIZADE_ID,
                        new AmizadeUpdateRequestDTO(EstadoAmizade.RECUSADA)));

        assertEquals("ESTADO_INVALIDO", erro.getCodigo());
    }

    // --- delete ---

    @Test
    void solicitanteCancelaSolicitacaoPendente() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.PENDENTE);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));

        service.delete(USUARIO_ID, AMIZADE_ID);

        verify(amizadeRepository).delete(amizade);
    }

    @Test
    void qualquerParticipanteRemoveAmizadeAceita() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.ACEITA);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));

        service.delete(USUARIO_ID, AMIZADE_ID);

        verify(amizadeRepository).delete(amizade);
    }

    @Test
    void naoSolicitanteNaoPodeCancelarSolicitacaoPendente() {
        Amizade amizade = amizade(AMIZADE_ID, USUARIO_ID, OUTRO_USUARIO_ID, EstadoAmizade.PENDENTE);
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, OUTRO_USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.of(amizade));

        AcessoNegadoException erro = assertThrows(AcessoNegadoException.class,
                () -> service.delete(OUTRO_USUARIO_ID, AMIZADE_ID));

        assertEquals("SOMENTE_SOLICITANTE", erro.getCodigo());
        verify(amizadeRepository, never()).delete(any());
    }

    @Test
    void amizadeInexistenteGeraNaoEncontradoNoDelete() {
        when(amizadeRepository.findByIdAndUsuario(AMIZADE_ID, USUARIO_ID, EstadoAmizade.RECUSADA))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.delete(USUARIO_ID, AMIZADE_ID));

        assertEquals("AMIZADE_NAO_ENCONTRADA", erro.getCodigo());
    }

    // --- Helpers ---

    private Amizade amizade(Long id, Long solicitanteId, Long destinatarioId, EstadoAmizade estado) {
        Amizade amizade = new Amizade();
        ReflectionTestUtils.setField(amizade, "id", id);
        amizade.setSolicitanteId(solicitanteId);
        amizade.setDestinatarioId(destinatarioId);
        amizade.setEstado(estado);
        ReflectionTestUtils.setField(amizade, "criadoEm", OffsetDateTime.now());
        return amizade;
    }

    private Usuario usuario(Long id, String email) {
        Usuario usuario = new Usuario();
        ReflectionTestUtils.setField(usuario, "id", id);
        usuario.setEmail(email);
        return usuario;
    }
}

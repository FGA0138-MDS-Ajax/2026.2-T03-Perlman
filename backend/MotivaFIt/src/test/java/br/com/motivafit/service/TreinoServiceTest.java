package br.com.motivafit.service;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.TreinoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TreinoServiceTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long TREINO_ID = 10L;

    private TreinoRepository repository;
    private TreinoService service;

    @BeforeEach
    void setup() {
        repository = mock(TreinoRepository.class);
        service = new TreinoService(repository);
    }


    @Test
    void criaTreinoDoUsuarioComVisibilidadePrivadaPorPadrao() {
        when(repository.saveAndFlush(any(Treino.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TreinoResponseDTO response = service.create(USUARIO_ID,
                new TreinoRequestDTO("  Treino A  ", TipoTreino.MUSCULACAO, null));

        ArgumentCaptor<Treino> captor = ArgumentCaptor.forClass(Treino.class);
        verify(repository).saveAndFlush(captor.capture());
        Treino salvo = captor.getValue();
        assertEquals(USUARIO_ID, salvo.getUsuarioId());
        assertEquals("Treino A", salvo.getNome());
        assertEquals(TipoTreino.MUSCULACAO, salvo.getTipo());
        assertEquals(Visibilidade.PRIVADO, salvo.getVisibilidade());
        assertEquals("Treino A", response.nome());
        assertEquals(Visibilidade.PRIVADO, response.visibilidade());
    }

    @Test
    void criaTreinoPublicoQuandoInformado() {
        when(repository.saveAndFlush(any(Treino.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TreinoResponseDTO response = service.create(USUARIO_ID,
                new TreinoRequestDTO("Corrida leve", TipoTreino.AEROBICO, Visibilidade.PUBLICO));

        assertEquals(TipoTreino.AEROBICO, response.tipo());
        assertEquals(Visibilidade.PUBLICO, response.visibilidade());
    }


    @Test
    void listaApenasOsTreinosAtivosDoUsuario() {
        Treino a = treino(1L, "Treino A", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        Treino b = treino(2L, "Treino B", TipoTreino.AEROBICO, Visibilidade.PUBLICO);
        when(repository.findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(USUARIO_ID, Visibilidade.PUBLICO)).thenReturn(List.of(a, b));

        List<TreinoResponseDTO> response = service.findAll(USUARIO_ID);

        assertEquals(2, response.size());
        assertEquals(1L, response.get(0).id());
        assertEquals("Treino A", response.get(0).nome());
        assertEquals(2L, response.get(1).id());
        assertEquals(Visibilidade.PUBLICO, response.get(1).visibilidade());
    }

    @Test
    void listaVaziaQuandoUsuarioNaoTemTreinos() {
        when(repository.findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(USUARIO_ID, Visibilidade.PUBLICO)).thenReturn(List.of());

        assertTrue(service.findAll(USUARIO_ID).isEmpty());
    }


    @Test
    void buscaTreinoDoUsuarioPorId() {
        Treino existente = treino(TREINO_ID, "Treino A", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(existente));

        TreinoResponseDTO response = service.findById(USUARIO_ID, TREINO_ID);

        assertEquals(TREINO_ID, response.id());
        assertEquals("Treino A", response.nome());
    }

    @Test
    void treinoInexistenteOuDeOutroUsuarioGeraNaoEncontrado() {
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.findById(USUARIO_ID, TREINO_ID));

        assertEquals("TREINO_NAO_ENCONTRADO", erro.getCodigo());
        assertEquals("Treino não encontrado", erro.getMessage());
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatus());
    }


    @Test
    void alteraTreinoExistente() {
        Treino existente = treino(TREINO_ID, "Antigo", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(existente));
        when(repository.saveAndFlush(existente)).thenReturn(existente);

        TreinoResponseDTO response = service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Novo", TipoTreino.AEROBICO, Visibilidade.PUBLICO));

        assertEquals("Novo", response.nome());
        assertEquals(TipoTreino.AEROBICO, response.tipo());
        assertEquals(Visibilidade.PUBLICO, response.visibilidade());
        verify(repository).saveAndFlush(existente);
    }

    @Test
    void alteracaoSemVisibilidadeMantemAVisibilidadeAtual() {
        Treino existente = treino(TREINO_ID, "Antigo", TipoTreino.MUSCULACAO, Visibilidade.PUBLICO);
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(existente));
        when(repository.saveAndFlush(existente)).thenReturn(existente);

        TreinoResponseDTO response = service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Novo", TipoTreino.MUSCULACAO, null));

        assertEquals(Visibilidade.PUBLICO, response.visibilidade());
    }

    @Test
    void alterarTreinoInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Novo", TipoTreino.MUSCULACAO, null)));

        verify(repository, never()).saveAndFlush(any());
    }


    @Test
    void excluirArquivaOTreinoSemApagarALinha() {
        Treino existente = treino(TREINO_ID, "Treino A", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(existente));

        service.delete(USUARIO_ID, TREINO_ID);

        assertNotNull(existente.getExcluidoEm());
        verify(repository).save(existente);
        verify(repository, never()).delete(any(Treino.class));
        verify(repository, never()).deleteById(any());
    }

    @Test
    void excluirTreinoInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findByIdEUsuarioOuPublico(TREINO_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.delete(USUARIO_ID, TREINO_ID));

        verify(repository, never()).save(any());
    }

    private Treino treino(Long id, String nome, TipoTreino tipo, Visibilidade visibilidade) {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", id);
        treino.setUsuarioId(USUARIO_ID);
        treino.setNome(nome);
        treino.setTipo(tipo);
        treino.setVisibilidade(visibilidade);
        return treino;
    }
}
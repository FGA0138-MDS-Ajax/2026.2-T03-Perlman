package br.com.motivafit.service;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.enums.TipoTreino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TreinoServiceTest {
    private static final Long USUARIO_ID = 7L;
    private static final Long TREINO_ID = 10L;
    private static final Long OUTRO_USUARIO_ID = 99L;
    private static final Long ORIGEM_ID = 20L;
    private static final Long COPIA_ID = 50L;

    private TreinoRepository repository;
    private ExercicioRepository exercicioRepository;
    private TreinoService service;

    @BeforeEach
    void setup() {
        repository = mock(TreinoRepository.class);
        exercicioRepository = mock(ExercicioRepository.class);
        service = new TreinoService(repository, exercicioRepository);
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
        assertTrue(response.meuTreino());
        assertTrue(response.podeEditar());
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
        assertTrue(response.get(0).meuTreino());
        assertTrue(response.get(0).podeEditar());
    }

    @Test
    void listaIndicaTreinoPublicoDeOutroUsuarioComoSomenteConsulta() {
        Treino meu = treino(1L, "Meu", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        Treino publico = treinoPublicoDeOutroUsuario(2L);
        when(repository.findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(List.of(meu, publico));

        List<TreinoResponseDTO> response = service.findAll(USUARIO_ID);

        assertTrue(response.get(0).meuTreino());
        assertTrue(response.get(0).podeEditar());
        assertFalse(response.get(1).meuTreino());
        assertFalse(response.get(1).podeEditar());
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
        when(repository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
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
        when(repository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(existente));
        when(repository.saveAndFlush(existente)).thenReturn(existente);

        TreinoResponseDTO response = service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Novo", TipoTreino.MUSCULACAO, null));

        assertEquals(Visibilidade.PUBLICO, response.visibilidade());
    }

    @Test
    void alterarTreinoInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Novo", TipoTreino.MUSCULACAO, null)));

        verify(repository, never()).saveAndFlush(any());
    }


    @Test
    void excluirArquivaOTreinoSemApagarALinha() {
        Treino existente = treino(TREINO_ID, "Treino A", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        when(repository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.of(existente));

        service.delete(USUARIO_ID, TREINO_ID);

        assertNotNull(existente.getExcluidoEm());
        verify(repository).save(existente);
        verify(repository, never()).delete(any(Treino.class));
        verify(repository, never()).deleteById(any());
    }

    @Test
    void excluirTreinoInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findByIdAndUsuarioIdAndExcluidoEmIsNull(TREINO_ID, USUARIO_ID))
                .thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.delete(USUARIO_ID, TREINO_ID));

        verify(repository, never()).save(any());
    }

    // ---------- permissão: leitura = dono ou público | escrita = somente o dono ----------

    @Test
    void usuarioPodeVerTreinoPublicoDeOutroUsuario() {
        stubOrigem(TREINO_ID, treinoPublicoDeOutroUsuario(TREINO_ID));

        TreinoResponseDTO response = service.findById(USUARIO_ID, TREINO_ID);

        assertEquals("Treino público", response.nome());
        assertFalse(response.meuTreino());
        assertFalse(response.podeEditar());
    }

    @Test
    void usuarioNaoAlteraTreinoPublicoDeOutroUsuario() {
        Treino publico = treinoPublicoDeOutroUsuario(TREINO_ID);
        // A busca "dono OU público" encontraria o treino; a alteração não pode usá-la.
        stubOrigem(TREINO_ID, publico);

        assertThrows(NaoEncontradoException.class, () -> service.update(USUARIO_ID, TREINO_ID,
                new TreinoRequestDTO("Alterado por outro", TipoTreino.AEROBICO, Visibilidade.PRIVADO)));

        assertEquals("Treino público", publico.getNome());
        assertEquals(Visibilidade.PUBLICO, publico.getVisibilidade());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void usuarioNaoExcluiTreinoPublicoDeOutroUsuario() {
        Treino publico = treinoPublicoDeOutroUsuario(TREINO_ID);
        stubOrigem(TREINO_ID, publico);

        assertThrows(NaoEncontradoException.class, () -> service.delete(USUARIO_ID, TREINO_ID));

        assertNull(publico.getExcluidoEm());
        verify(repository, never()).save(any());
    }

    // ---------- adicionar (RF-04) ----------

    @Test
    void adicionaCopiaPrivadaDoTreinoPublicoDeOutroUsuarioComSeusExercicios() {
        Treino origem = treinoPublicoDeOutroUsuario(ORIGEM_ID);
        CatalogoExercicio supino = catalogo(1L, "Supino reto", true);
        CatalogoExercicio crucifixo = catalogo(2L, "Crucifixo", true);
        stubOrigem(ORIGEM_ID, origem);
        stubSalvarCopia();
        when(exercicioRepository.findAllByTreinoId(ORIGEM_ID)).thenReturn(List.of(
                exercicio(origem, supino, "3x10 - 60kg", "70kg"),
                exercicio(origem, crucifixo, "3x12", null)));

        TreinoResponseDTO response = service.adicionar(USUARIO_ID, ORIGEM_ID);

        Treino copia = capturarCopia();
        assertEquals(USUARIO_ID, copia.getUsuarioId());
        assertEquals("Treino público", copia.getNome());
        assertEquals(TipoTreino.MUSCULACAO, copia.getTipo());
        assertEquals(Visibilidade.PRIVADO, copia.getVisibilidade());
        assertNull(copia.getExcluidoEm());
        assertEquals(COPIA_ID, response.id());
        assertEquals(Visibilidade.PRIVADO, response.visibilidade());
        assertTrue(response.meuTreino());
        assertTrue(response.podeEditar());

        List<Exercicio> copiados = capturarExerciciosSalvos();
        assertEquals(2, copiados.size());
        assertSame(copia, copiados.get(0).getTreino());
        assertSame(supino, copiados.get(0).getCatalogoExercicio());
        assertEquals("3x10 - 60kg", copiados.get(0).getMeta());
        assertNull(copiados.get(0).getMetaRecorde());
        assertSame(copia, copiados.get(1).getTreino());
        assertSame(crucifixo, copiados.get(1).getCatalogoExercicio());
        assertEquals("3x12", copiados.get(1).getMeta());
        assertNull(copiados.get(1).getMetaRecorde());
    }

    @Test
    void salvaACopiaDoTreinoAntesDeSeusExercicios() {
        Treino origem = treinoPublicoDeOutroUsuario(ORIGEM_ID);
        stubOrigem(ORIGEM_ID, origem);
        stubSalvarCopia();
        when(exercicioRepository.findAllByTreinoId(ORIGEM_ID))
                .thenReturn(List.of(exercicio(origem, catalogo(1L, "Supino reto", true), "3x10", null)));

        service.adicionar(USUARIO_ID, ORIGEM_ID);

        InOrder ordem = inOrder(repository, exercicioRepository);
        ordem.verify(repository).saveAndFlush(any(Treino.class));
        ordem.verify(exercicioRepository).saveAll(anyList());
    }

    @Test
    void naoCopiaExerciciosCujoItemDoCatalogoFoiDesativado() {
        Treino origem = treinoPublicoDeOutroUsuario(ORIGEM_ID);
        CatalogoExercicio ativo = catalogo(1L, "Supino reto", true);
        CatalogoExercicio desativado = catalogo(2L, "Crucifixo", false);
        stubOrigem(ORIGEM_ID, origem);
        stubSalvarCopia();
        when(exercicioRepository.findAllByTreinoId(ORIGEM_ID)).thenReturn(List.of(
                exercicio(origem, ativo, "3x10", null),
                exercicio(origem, desativado, "3x12", null)));

        service.adicionar(USUARIO_ID, ORIGEM_ID);

        List<Exercicio> copiados = capturarExerciciosSalvos();
        assertEquals(1, copiados.size());
        assertSame(ativo, copiados.get(0).getCatalogoExercicio());
    }

    @Test
    void adicionaTreinoSemExerciciosSemChamarSaveAll() {
        stubOrigem(ORIGEM_ID, treinoPublicoDeOutroUsuario(ORIGEM_ID));
        stubSalvarCopia();
        when(exercicioRepository.findAllByTreinoId(ORIGEM_ID)).thenReturn(List.of());

        TreinoResponseDTO response = service.adicionar(USUARIO_ID, ORIGEM_ID);

        assertEquals(COPIA_ID, response.id());
        verify(exercicioRepository, never()).saveAll(anyList());
    }

    @Test
    void treinoInexistenteExcluidoOuPrivadoDeOutroUsuarioNaoPodeSerAdicionado() {
        when(repository.findByIdEUsuarioOuPublico(ORIGEM_ID, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.adicionar(USUARIO_ID, ORIGEM_ID));

        assertEquals("TREINO_NAO_ENCONTRADO", erro.getCodigo());
        assertEquals(HttpStatus.NOT_FOUND, erro.getStatus());
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(exercicioRepository);
    }

    @Test
    void adicionarTreinoQueJaEDoUsuarioGeraConflito() {
        Treino proprio = treino(ORIGEM_ID, "Meu treino", TipoTreino.MUSCULACAO, Visibilidade.PRIVADO);
        stubOrigem(ORIGEM_ID, proprio);

        ConflitoException erro = assertThrows(ConflitoException.class,
                () -> service.adicionar(USUARIO_ID, ORIGEM_ID));

        assertEquals("TREINO_JA_NA_LISTA", erro.getCodigo());
        assertEquals(HttpStatus.CONFLICT, erro.getStatus());
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(exercicioRepository);
    }

    // ---------- auxiliares dos testes de permissão e de adicionar ----------

    private void stubOrigem(Long id, Treino treino) {
        when(repository.findByIdEUsuarioOuPublico(id, USUARIO_ID, Visibilidade.PUBLICO))
                .thenReturn(Optional.of(treino));
    }

    private void stubSalvarCopia() {
        when(repository.saveAndFlush(any(Treino.class))).thenAnswer(invocation -> {
            Treino salvo = invocation.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id", COPIA_ID);
            return salvo;
        });
    }

    private Treino capturarCopia() {
        ArgumentCaptor<Treino> captor = ArgumentCaptor.forClass(Treino.class);
        verify(repository).saveAndFlush(captor.capture());
        return captor.getValue();
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<Exercicio> capturarExerciciosSalvos() {
        ArgumentCaptor<List> captor = ArgumentCaptor.forClass(List.class);
        verify(exercicioRepository).saveAll(captor.capture());
        return (List<Exercicio>) captor.getValue();
    }

    private Treino treinoPublicoDeOutroUsuario(Long id) {
        Treino publico = treino(id, "Treino público", TipoTreino.MUSCULACAO, Visibilidade.PUBLICO);
        publico.setUsuarioId(OUTRO_USUARIO_ID);
        return publico;
    }

    private CatalogoExercicio catalogo(Long id, String nome, boolean ativo) {
        CatalogoExercicio catalogo = new CatalogoExercicio(nome, Modalidade.MUSCULACAO, "Peito");
        ReflectionTestUtils.setField(catalogo, "id", id);
        if (!ativo) {
            catalogo.desativar();
        }
        return catalogo;
    }

    private Exercicio exercicio(Treino treino, CatalogoExercicio catalogo, String meta, String metaRecorde) {
        Exercicio exercicio = new Exercicio();
        exercicio.setTreino(treino);
        exercicio.setCatalogoExercicio(catalogo);
        exercicio.setMeta(meta);
        exercicio.setMetaRecorde(metaRecorde);
        return exercicio;
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
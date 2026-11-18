package br.com.motivafit.service;

import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CatalogoExercicioAdminServiceTest {
    private static final Long ID = 5L;

    private CatalogoExercicioRepository repository;
    private CatalogoExercicioAdminService service;

    @BeforeEach
    void setup() {
        repository = mock(CatalogoExercicioRepository.class);
        service = new CatalogoExercicioAdminService(repository);
    }


    @Test
    void criaExercicioAtivoComDadosSemEspacosNasPontas() {
        when(repository.existsByNomeIgnoreCase("Remada cavalinho")).thenReturn(false);
        when(repository.save(any(CatalogoExercicio.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CatalogoExercicioResponseDTO response = service.create(
                new CatalogoExercicioRequestDTO("  Remada cavalinho ", Modalidade.MUSCULACAO, " Costas "));

        ArgumentCaptor<CatalogoExercicio> captor = ArgumentCaptor.forClass(CatalogoExercicio.class);
        verify(repository).save(captor.capture());
        CatalogoExercicio salvo = captor.getValue();
        assertEquals("Remada cavalinho", salvo.getNome());
        assertEquals("Costas", salvo.getGrupoMuscular());
        assertTrue(salvo.getAtivo());
        assertEquals("Remada cavalinho", response.nome());
        assertEquals(Modalidade.MUSCULACAO, response.modalidade());
    }

    @Test
    void nomeRepetidoNaCriacaoGeraConflitoSemSalvar() {
        when(repository.existsByNomeIgnoreCase("Supino reto")).thenReturn(true);

        ConflitoException erro = assertThrows(ConflitoException.class, () -> service.create(
                new CatalogoExercicioRequestDTO("Supino reto", Modalidade.MUSCULACAO, "Peito")));

        assertEquals("EXERCICIO_JA_CADASTRADO", erro.getCodigo());
        assertEquals("Já existe um exercício com esse nome", erro.getMessage());
        assertEquals(HttpStatus.CONFLICT, erro.getStatus());
        verify(repository, never()).save(any());
    }

    @Test
    void alteraExercicioExistente() {
        CatalogoExercicio existente = exercicio("Corrida", Modalidade.AEROBICO, "Cardio");
        when(repository.findById(ID)).thenReturn(Optional.of(existente));
        when(repository.existsByNomeIgnoreCaseAndIdNot("Stiff", ID)).thenReturn(false);
        when(repository.save(existente)).thenReturn(existente);

        CatalogoExercicioResponseDTO response = service.update(ID,
                new CatalogoExercicioRequestDTO(" Stiff ", Modalidade.MUSCULACAO, "Posterior de coxa"));

        assertEquals(ID, response.id());
        assertEquals("Stiff", response.nome());
        assertEquals(Modalidade.MUSCULACAO, response.modalidade());
        assertEquals("Posterior de coxa", response.grupoMuscular());
        verify(repository).save(existente);
    }

    @Test
    void alterarExercicioInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class, () -> service.update(ID,
                new CatalogoExercicioRequestDTO("Stiff", Modalidade.MUSCULACAO, "Posterior de coxa")));

        assertEquals("EXERCICIO_NAO_ENCONTRADO", erro.getCodigo());
        verify(repository, never()).save(any());
    }

    @Test
    void nomeDeOutroExercicioNaAlteracaoGeraConflitoSemMudarOExercicio() {
        CatalogoExercicio existente = exercicio("Corrida", Modalidade.AEROBICO, "Cardio");
        when(repository.findById(ID)).thenReturn(Optional.of(existente));
        when(repository.existsByNomeIgnoreCaseAndIdNot("Supino reto", ID)).thenReturn(true);

        assertThrows(ConflitoException.class, () -> service.update(ID,
                new CatalogoExercicioRequestDTO("Supino reto", Modalidade.MUSCULACAO, "Peito")));

        assertEquals("Corrida", existente.getNome());
        verify(repository, never()).save(any());
    }

    @Test
    void desativarMarcaOExercicioComoInativoSemApagarALinha() {
        CatalogoExercicio existente = exercicio("Corrida", Modalidade.AEROBICO, "Cardio");
        when(repository.findById(ID)).thenReturn(Optional.of(existente));

        service.deactivate(ID);

        assertFalse(existente.getAtivo());
        verify(repository).save(existente);
        verify(repository, never()).delete(any(CatalogoExercicio.class));
        verify(repository, never()).deleteById(any());
    }

    @Test
    void desativarExercicioJaDesativadoNaoGeraErro() {
        CatalogoExercicio existente = exercicio("Corrida", Modalidade.AEROBICO, "Cardio");
        existente.desativar();
        when(repository.findById(ID)).thenReturn(Optional.of(existente));

        assertDoesNotThrow(() -> service.deactivate(ID));

        assertFalse(existente.getAtivo());
    }

    @Test
    void desativarExercicioInexistenteGeraNaoEncontradoSemSalvar() {
        when(repository.findById(ID)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.deactivate(ID));

        verify(repository, never()).save(any());
    }

    private CatalogoExercicio exercicio(String nome, Modalidade modalidade, String grupo) {
        CatalogoExercicio exercicio = new CatalogoExercicio(nome, modalidade, grupo);
        ReflectionTestUtils.setField(exercicio, "id", ID);
        return exercicio;
    }
}
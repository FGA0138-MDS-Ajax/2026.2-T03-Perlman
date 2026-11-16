package br.com.motivafit.service;

import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.RegistroDiario;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.RegistroDiarioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistroDiarioServiceTest {

    private static final Long USUARIO_ID = 1L;
    private static final Long CATALOGO_ID = 10L;
    private static final Long TREINO_ID = 20L;

    @InjectMocks
    private RegistroDiarioService service;

    @Mock
    private RegistroDiarioRepository registroRepository;

    @Mock
    private CatalogoExercicioRepository catalogoRepository;

    @Mock
    private TreinoRepository treinoRepository;

    @Mock
    private ExercicioRepository exercicioRepository;

    private CatalogoExercicio catalogo;
    private RegistroDiarioRequestDTO requestValido;

    @BeforeEach
    void setup() {
        catalogo = new CatalogoExercicio("Supino Reto", Modalidade.MUSCULACAO, "Peito");

        requestValido = new RegistroDiarioRequestDTO(
                CATALOGO_ID, TREINO_ID, null, new BigDecimal("80"),
                10, 3, 3600, null, OffsetDateTime.now(), "chave-123"
        );
    }

    @Test
    void deveCriarRegistroDiarioComSucesso() {
        Treino treino = new Treino();
        ReflectionTestUtils.setField(treino, "id", TREINO_ID);
        treino.setUsuarioId(USUARIO_ID);
        treino.setNome("Ficha A");

        when(catalogoRepository.findByIdAndAtivoTrue(CATALOGO_ID)).thenReturn(Optional.of(catalogo));
        when(treinoRepository.findById(TREINO_ID)).thenReturn(Optional.of(treino));

        when(registroRepository.saveAndFlush(any(RegistroDiario.class))).thenAnswer(i -> {
            RegistroDiario r = i.getArgument(0);
            ReflectionTestUtils.setField(r, "id", 100L); // Simulando que o banco gerou um ID
            return r;
        });

        RegistroDiarioResponseDTO response = service.create(USUARIO_ID, requestValido);

        assertNotNull(response.id());
        assertEquals("Supino Reto", response.exercicioNome());
        assertEquals("Ficha A", response.treinoNome());
        verify(registroRepository).saveAndFlush(any(RegistroDiario.class)); // Garante que mandou salvar
    }

    @Test
    void deveListarRegistrosComPaginacao() {
        RegistroDiario registroSimulado = new RegistroDiario();
        ReflectionTestUtils.setField(registroSimulado, "id", 55L);
        registroSimulado.setExercicioNome("Agachamento");

        when(registroRepository.findAllByUsuarioIdOrderByExecutadoEmDesc(eq(USUARIO_ID), any(Pageable.class)))
                .thenReturn(List.of(registroSimulado));

        List<RegistroDiarioResponseDTO> response = service.findAll(USUARIO_ID, 0, 10);

        assertFalse(response.isEmpty());
        assertEquals(1, response.size());
        assertEquals("Agachamento", response.get(0).exercicioNome());
    }

    @Test
    void deveBuscarRegistroPorIdDoUsuario() {
        RegistroDiario registro = new RegistroDiario();
        ReflectionTestUtils.setField(registro, "id", 55L);
        registro.setExercicioNome("Agachamento");
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.of(registro));

        RegistroDiarioResponseDTO response = service.findById(USUARIO_ID, 55L);

        assertEquals(55L, response.id());
        assertEquals("Agachamento", response.exercicioNome());
    }

    @Test
    void deveLancarExcecaoQuandoRegistroNaoPertenceAoUsuario() {
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.findById(USUARIO_ID, 55L));

        assertEquals("NAO_ENCONTRADO", erro.getCodigo());
    }

    @Test
    void deveLancarExcecaoQuandoCatalogoNaoExiste() {
        when(catalogoRepository.findByIdAndAtivoTrue(CATALOGO_ID)).thenReturn(Optional.empty());

        NaoEncontradoException erro = assertThrows(NaoEncontradoException.class,
                () -> service.create(USUARIO_ID, requestValido));

        assertEquals("EXERCICIO_NAO_ENCONTRADO", erro.getCodigo());
        verify(registroRepository, never()).saveAndFlush(any()); // Garante que NÃO tentou salvar
    }

    @Test
    void deveLancarExcecaoQuandoTreinoPertenceAOutroUsuario() {
        Treino treinoDeOutro = new Treino();
        ReflectionTestUtils.setField(treinoDeOutro, "id", TREINO_ID);
        treinoDeOutro.setUsuarioId(99L); // ID diferente do USUARIO_ID

        when(catalogoRepository.findByIdAndAtivoTrue(CATALOGO_ID)).thenReturn(Optional.of(catalogo));
        when(treinoRepository.findById(TREINO_ID)).thenReturn(Optional.of(treinoDeOutro));
        
        assertThrows(NaoEncontradoException.class,
                () -> service.create(USUARIO_ID, requestValido));

        verify(registroRepository, never()).saveAndFlush(any());
    }

    @Test
    void deveAtualizarRegistroDoUsuario() {
        RegistroDiario registro = new RegistroDiario();
        ReflectionTestUtils.setField(registro, "id", 55L);
        registro.setUsuarioId(USUARIO_ID);
        registro.setCatalogoId(CATALOGO_ID);
        registro.setExercicioNome("Supino Reto");
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.of(registro));
        when(catalogoRepository.findByIdAndAtivoTrue(CATALOGO_ID)).thenReturn(Optional.of(catalogo));
        when(registroRepository.saveAndFlush(registro)).thenReturn(registro);

        RegistroDiarioResponseDTO response = service.update(USUARIO_ID, 55L,
                new RegistroDiarioRequestDTO(CATALOGO_ID, null, null, new BigDecimal("90"), 8, 4,
                        1500, null, OffsetDateTime.now(), null));

        assertEquals(new BigDecimal("90"), response.cargaKg());
        assertEquals(4, response.series());
        verify(registroRepository).saveAndFlush(registro);
    }

    @Test
    void naoDevePermitirAlterarCatalogoDoRegistro() {
        RegistroDiario registro = new RegistroDiario();
        registro.setCatalogoId(CATALOGO_ID);
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.of(registro));

        assertThrows(br.com.motivafit.exception.RequisicaoInvalidaException.class, () -> service.update(USUARIO_ID, 55L,
                new RegistroDiarioRequestDTO(999L, null, null, null, 8, 3, 100, null, null, null)));
        verify(registroRepository, never()).saveAndFlush(any());
    }

    @Test
    void deveExcluirRegistroDoUsuario() {
        RegistroDiario registro = new RegistroDiario();
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.of(registro));

        service.delete(USUARIO_ID, 55L);

        verify(registroRepository).delete(registro);
    }

    @Test
    void naoDeveExcluirRegistroDeOutroUsuario() {
        when(registroRepository.findByIdAndUsuarioId(55L, USUARIO_ID)).thenReturn(Optional.empty());

        assertThrows(NaoEncontradoException.class, () -> service.delete(USUARIO_ID, 55L));
        verify(registroRepository, never()).delete(any());
    }
}

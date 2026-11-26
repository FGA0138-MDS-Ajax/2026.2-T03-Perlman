package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.ExercicioMapper;
import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ExercicioService {

    private final ExercicioRepository exercicioRepository;
    private final TreinoRepository treinoRepository;
    private final CatalogoExercicioRepository catalogoExercicioRepository;
    private final ExercicioMapper exercicioMapper;

    public ExercicioService(ExercicioRepository exercicioRepository,
                            TreinoRepository treinoRepository,
                            CatalogoExercicioRepository catalogoExercicioRepository,
                            ExercicioMapper exercicioMapper) {
        this.exercicioRepository = exercicioRepository;
        this.treinoRepository = treinoRepository;
        this.catalogoExercicioRepository = catalogoExercicioRepository;
        this.exercicioMapper = exercicioMapper;
    }

    public List<ExercicioResponseDTO> listar(Long usuarioId, Long treinoId) {
        Treino treino = treinoVisivel(usuarioId, treinoId);
        return exercicioRepository.findByTreinoIdOrderByIdAsc(treino.getId()).stream()
                .map(exercicioMapper::toDto)
                .toList();
    }

    @Transactional
    public ExercicioResponseDTO adicionar(Long usuarioId, Long treinoId, ExercicioRequestDTO dto) {
        exigirMesmoTreino(treinoId, dto.treinoId());
        Treino treino = treinoDoUsuario(usuarioId, treinoId);
        CatalogoExercicio catalogo = catalogoAtivo(dto.catalogoExercicioId());
        Exercicio novo = exercicioMapper.toEntity(dto, treino, catalogo);
        aplicarTexto(novo, dto);
        return exercicioMapper.toDto(exercicioRepository.save(novo));
    }

    @Transactional
    public ExercicioResponseDTO alterar(Long usuarioId, Long treinoId, Long exercicioId, ExercicioRequestDTO dto) {
        exigirMesmoTreino(treinoId, dto.treinoId());
        treinoDoUsuario(usuarioId, treinoId);
        Exercicio exercicio = exercicioDoTreino(exercicioId, treinoId);
        if (!exercicio.getCatalogoExercicio().getId().equals(dto.catalogoExercicioId())) {
            throw new RequisicaoInvalidaException(
                    "CATALOGO_DIVERGENTE", "O exercício do catálogo não pode ser trocado nesta associação");
        }
        aplicarTexto(exercicio, dto);
        return exercicioMapper.toDto(exercicioRepository.save(exercicio));
    }

    @Transactional
    public void remover(Long usuarioId, Long treinoId, Long exercicioId) {
        treinoDoUsuario(usuarioId, treinoId);
        exercicioRepository.delete(exercicioDoTreino(exercicioId, treinoId));
    }

    private void aplicarTexto(Exercicio exercicio, ExercicioRequestDTO dto) {
        exercicio.setMeta(dto.meta().trim());
        String recorde = dto.metaRecorde();
        exercicio.setMetaRecorde(recorde == null || recorde.isBlank() ? null : recorde.trim());
    }

    private void exigirMesmoTreino(Long treinoId, Long treinoInformado) {
        if (!treinoId.equals(treinoInformado)) {
            throw new RequisicaoInvalidaException(
                    "TREINO_DIVERGENTE", "O treino informado não corresponde ao endereço da requisição");
        }
    }

    private Treino treinoVisivel(Long usuarioId, Long treinoId) {
        return treinoRepository.findByIdEUsuarioOuPublico(treinoId, usuarioId, Visibilidade.PUBLICO)
                .orElseThrow(this::treinoNaoEncontrado);
    }

    private Treino treinoDoUsuario(Long usuarioId, Long treinoId) {
        return treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(treinoId, usuarioId)
                .orElseThrow(this::treinoNaoEncontrado);
    }

    private CatalogoExercicio catalogoAtivo(Long catalogoId) {
        return catalogoExercicioRepository.findByIdAndAtivoTrue(catalogoId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "CATALOGO_NAO_ENCONTRADO", "Exercício do catálogo não encontrado"));
    }

    private Exercicio exercicioDoTreino(Long exercicioId, Long treinoId) {
        return exercicioRepository.findByIdAndTreinoId(exercicioId, treinoId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
    }

    private NaoEncontradoException treinoNaoEncontrado() {
        return new NaoEncontradoException("TREINO_NAO_ENCONTRADO", "Treino não encontrado");
    }
}

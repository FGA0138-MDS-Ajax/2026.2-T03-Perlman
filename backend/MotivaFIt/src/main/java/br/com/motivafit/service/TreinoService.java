package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.TreinoMapper;
import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class TreinoService {

    private final TreinoRepository treinoRepository;
    private final ExercicioRepository exercicioRepository;

    public TreinoService(TreinoRepository treinoRepository, ExercicioRepository exercicioRepository) {
        this.treinoRepository = treinoRepository;
        this.exercicioRepository = exercicioRepository;
    }

    @Transactional
    public TreinoResponseDTO create(Long usuarioId, TreinoRequestDTO request) {
        Treino entity = TreinoMapper.toEntity(request, usuarioId);
        return TreinoMapper.toDto(treinoRepository.saveAndFlush(entity), usuarioId);
    }

    @Transactional(readOnly = true)
    public List<TreinoResponseDTO> findAll(Long usuarioId) {
        return treinoRepository.findAllByUsuarioIdAndExcluidoEmIsNullOrVisibilidadeAndExcluidoEmIsNull(usuarioId, Visibilidade.PUBLICO)
                .stream()
                .map(treino -> TreinoMapper.toDto(treino, usuarioId))
                .toList();
    }

    @Transactional(readOnly = true)
    public TreinoResponseDTO findById(Long usuarioId, Long id) {
        return TreinoMapper.toDto(buscarTreinoVisivel(usuarioId, id), usuarioId);
    }

    @Transactional
    public TreinoResponseDTO update(Long usuarioId, Long id, TreinoRequestDTO request) {
        Treino entity = buscarTreinoDoUsuario(usuarioId, id);
        TreinoMapper.updateEntity(entity, request);
        return TreinoMapper.toDto(treinoRepository.saveAndFlush(entity), usuarioId);
    }

    @Transactional
    public void delete(Long usuarioId, Long id) {
        Treino entity = buscarTreinoDoUsuario(usuarioId, id);
        entity.setExcluidoEm(OffsetDateTime.now());
        treinoRepository.save(entity);
    }


    @Transactional
    public TreinoResponseDTO adicionar(Long usuarioId, Long id) {
        Treino origem = buscarTreinoVisivel(usuarioId, id);
        if (origem.getUsuarioId().equals(usuarioId)) {
            throw new ConflitoException("TREINO_JA_NA_LISTA", "Este treino já está na sua lista");
        }

        Treino copia = treinoRepository.saveAndFlush(copiarTreino(origem, usuarioId));
        List<Exercicio> exerciciosCopiados = copiarExercicios(origem, copia);
        if (!exerciciosCopiados.isEmpty()) {
            exercicioRepository.saveAll(exerciciosCopiados);
        }
        return TreinoMapper.toDto(copia, usuarioId);
    }

    private Treino copiarTreino(Treino origem, Long usuarioId) {
        Treino copia = new Treino();
        copia.setUsuarioId(usuarioId);
        copia.setNome(origem.getNome());
        copia.setTipo(origem.getTipo());
        copia.setVisibilidade(Visibilidade.PRIVADO);
        return copia;
    }


    private List<Exercicio> copiarExercicios(Treino origem, Treino copia) {
        return exercicioRepository.findAllByTreinoId(origem.getId()).stream()
                .filter(exercicio -> Boolean.TRUE.equals(exercicio.getCatalogoExercicio().getAtivo()))
                .map(exercicio -> {
                    Exercicio novo = new Exercicio();
                    novo.setTreino(copia);
                    novo.setCatalogoExercicio(exercicio.getCatalogoExercicio());
                    novo.setMeta(exercicio.getMeta());
                    return novo;
                })
                .toList();
    }

    private Treino buscarTreinoVisivel(Long usuarioId, Long id) {
        return treinoRepository.findByIdEUsuarioOuPublico(id, usuarioId, Visibilidade.PUBLICO)
                .orElseThrow(() -> new NaoEncontradoException(
                        "TREINO_NAO_ENCONTRADO", "Treino não encontrado"));
    }


    private Treino buscarTreinoDoUsuario(Long usuarioId, Long id) {
        return treinoRepository.findByIdAndUsuarioIdAndExcluidoEmIsNull(id, usuarioId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "TREINO_NAO_ENCONTRADO", "Treino não encontrado"));
    }
}
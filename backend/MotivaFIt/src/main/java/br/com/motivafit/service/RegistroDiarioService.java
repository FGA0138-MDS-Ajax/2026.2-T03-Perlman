package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.RegistroDiarioMapper;
import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Exercicio;
import br.com.motivafit.entity.RegistroDiario;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.ExercicioRepository;
import br.com.motivafit.repository.RegistroDiarioRepository;
import br.com.motivafit.repository.TreinoRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RegistroDiarioService {

    private static final int TAMANHO_MAXIMO = 100;
    private static final long TOLERANCIA_RELOGIO_MINUTOS = 5;

    private final RegistroDiarioRepository registroRepository;
    private final CatalogoExercicioRepository catalogoRepository;
    private final TreinoRepository treinoRepository;
    private final ExercicioRepository exercicioRepository;

    public RegistroDiarioService(RegistroDiarioRepository registroRepository,
                                 CatalogoExercicioRepository catalogoRepository,
                                 TreinoRepository treinoRepository,
                                 ExercicioRepository exercicioRepository) {
        this.registroRepository = registroRepository;
        this.catalogoRepository = catalogoRepository;
        this.treinoRepository = treinoRepository;
        this.exercicioRepository = exercicioRepository;
    }

    @Transactional
    public RegistroDiarioResponseDTO create(Long usuarioId, RegistroDiarioRequestDTO request) {
        String chave = normalizarChave(request.chaveIdempotencia());
        if (chave != null) {
            Optional<RegistroDiario> existente =
                    registroRepository.findByUsuarioIdAndChaveIdempotencia(usuarioId, chave);
            if (existente.isPresent()) {
                return RegistroDiarioMapper.toDto(existente.get());
            }
        }

        validarData(request.executadoEm());
        CatalogoExercicio catalogo = buscarCatalogoAtivo(request.catalogoId());
        validarMetricas(catalogo.getModalidade(), request);

        RegistroDiario registro = RegistroDiarioMapper.toEntity(request, usuarioId);
        registro.setExercicioNome(catalogo.getNome());
        registro.setChaveIdempotencia(chave);
        vincularRotina(usuarioId, request, registro);

        return RegistroDiarioMapper.toDto(registroRepository.saveAndFlush(registro));
    }

    @Transactional(readOnly = true)
    public List<RegistroDiarioResponseDTO> findAll(Long usuarioId, int pagina, int tamanho) {
        int paginaSegura = Math.max(pagina, 0);
        int tamanhoSeguro = Math.min(Math.max(tamanho, 1), TAMANHO_MAXIMO);

        return registroRepository
                .findAllByUsuarioIdOrderByExecutadoEmDesc(usuarioId, PageRequest.of(paginaSegura, tamanhoSeguro))
                .stream()
                .map(RegistroDiarioMapper::toDto)
                .toList();
    }

    private String normalizarChave(String chave) {
        if (chave == null || chave.isBlank()) {
            return null;
        }
        return chave.trim();
    }

    private void validarData(OffsetDateTime executadoEm) {
        if (executadoEm != null
                && executadoEm.isAfter(OffsetDateTime.now().plusMinutes(TOLERANCIA_RELOGIO_MINUTOS))) {
            throw registroInvalido("A data de execução não pode estar no futuro");
        }
    }

    private void validarMetricas(Modalidade modalidade, RegistroDiarioRequestDTO request) {
        if (modalidade == Modalidade.MUSCULACAO) {
            if (request.series() == null || request.repeticoes() == null) {
                throw registroInvalido("Para exercícios de musculação, informe séries e repetições");
            }
            if (request.distanciaM() != null) {
                throw registroInvalido("A distância não se aplica a exercícios de musculação");
            }
        } else if (request.cargaKg() != null || request.series() != null || request.repeticoes() != null) {
            throw registroInvalido("Carga, séries e repetições não se aplicam a exercícios aeróbicos");
        }
    }

    private void vincularRotina(Long usuarioId, RegistroDiarioRequestDTO request, RegistroDiario registro) {
        Treino treino = null;

        if (request.exercicioId() != null) {
            Exercicio exercicio = buscarExercicioDoUsuario(usuarioId, request.exercicioId());
            if (!exercicio.getCatalogoExercicio().getId().equals(request.catalogoId())) {
                throw registroInvalido("O exercício do treino não corresponde ao exercício do catálogo informado");
            }
            if (request.treinoId() != null && !request.treinoId().equals(exercicio.getTreino().getId())) {
                throw registroInvalido("O exercício informado não pertence ao treino informado");
            }
            treino = exercicio.getTreino();
            registro.setExercicioId(exercicio.getId());
        } else if (request.treinoId() != null) {
            treino = buscarTreinoDoUsuario(usuarioId, request.treinoId());
        }

        if (treino != null) {
            registro.setTreinoId(treino.getId());
            registro.setTreinoNome(treino.getNome());
        }
    }

    private CatalogoExercicio buscarCatalogoAtivo(Long catalogoId) {
        return catalogoRepository.findByIdAndAtivoTrue(catalogoId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
    }

    private Treino buscarTreinoDoUsuario(Long usuarioId, Long treinoId) {
        return treinoRepository.findById(treinoId)
                .filter(treino -> pertenceAoUsuario(treino, usuarioId))
                .orElseThrow(() -> new NaoEncontradoException(
                        "TREINO_NAO_ENCONTRADO", "Treino não encontrado"));
    }

    private Exercicio buscarExercicioDoUsuario(Long usuarioId, Long exercicioId) {
        return exercicioRepository.findById(exercicioId)
                .filter(exercicio -> pertenceAoUsuario(exercicio.getTreino(), usuarioId))
                .orElseThrow(() -> new NaoEncontradoException(
                        "EXERCICIO_DO_TREINO_NAO_ENCONTRADO", "Exercício do treino não encontrado"));
    }

    private boolean pertenceAoUsuario(Treino treino, Long usuarioId) {
        return treino.getExcluidoEm() == null && treino.getUsuarioId().equals(usuarioId);
    }

    private RequisicaoInvalidaException registroInvalido(String mensagem) {
        return new RequisicaoInvalidaException("REGISTRO_INVALIDO", mensagem);
    }
}
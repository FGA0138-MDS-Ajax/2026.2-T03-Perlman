package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.DesafioMapper;
import br.com.motivafit.dto.request.AdicionarParticipanteRequestDTO;
import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.request.ParticipanteUpdateRequestDTO;
import br.com.motivafit.dto.response.DesafioParticipanteResponseDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;
import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.enums.Visibilidade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.DesafioItemRepository;
import br.com.motivafit.repository.DesafioParticipanteRepository;
import br.com.motivafit.repository.DesafioRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DesafioService {

    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private final DesafioRepository desafioRepository;
    private final DesafioItemRepository itemRepository;
    private final DesafioParticipanteRepository participanteRepository;
    private final CatalogoExercicioRepository catalogoRepository;
    private final UsuarioRepository usuarioRepository;

    public DesafioService(DesafioRepository desafioRepository,
                          DesafioItemRepository itemRepository,
                          DesafioParticipanteRepository participanteRepository,
                          CatalogoExercicioRepository catalogoRepository,
                          UsuarioRepository usuarioRepository) {
        this.desafioRepository = desafioRepository;
        this.itemRepository = itemRepository;
        this.participanteRepository = participanteRepository;
        this.catalogoRepository = catalogoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public DesafioResponseDTO create(Long usuarioId, DesafioRequestDTO request) {
        validarPrazo(request.prazo());
        validarItensRepetidos(request.itens());

        Map<Long, CatalogoExercicio> catalogos = new HashMap<>();
        for (DesafioItemRequestDTO item : request.itens()) {
            CatalogoExercicio catalogo = catalogoRepository.findByIdAndAtivoTrue(item.catalogoId())
                    .orElseThrow(() -> new NaoEncontradoException(
                            "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
            validarMetas(catalogo.getModalidade(), item);
            catalogos.put(catalogo.getId(), catalogo);
        }

        Visibilidade visibilidade = request.visibilidade() != null ? request.visibilidade() : Visibilidade.PRIVADO;
        Desafio desafio = desafioRepository.saveAndFlush(
                new Desafio(usuarioId, request.titulo().trim(), request.prazo(), request.descricao(), visibilidade));
        List<DesafioItem> itens = itemRepository.saveAll(request.itens().stream()
                .map(item -> DesafioMapper.toItemEntity(desafio.getId(), item))
                .toList());
        participanteRepository.save(criadorComoParticipante(desafio.getId(), usuarioId));

        return DesafioMapper.toResponse(desafio, itens, catalogos, usuarioId);
    }

    @Transactional(readOnly = true)
    public List<DesafioResponseDTO> findAll(Long usuarioId) {
        List<Desafio> desafios = desafioRepository.findCriadosOuPublicos(
                usuarioId, EstadoDesafio.ATIVO, Visibilidade.PUBLICO);
        if (desafios.isEmpty()) {
            return List.of();
        }

        return montarRespostas(desafios, usuarioId);
    }

    @Transactional(readOnly = true)
    public DesafioResponseDTO findById(Long usuarioId, Long id) {
        Desafio desafio = desafioRepository.findCriadoOuPublicoPorId(
                id, usuarioId, EstadoDesafio.ATIVO, Visibilidade.PUBLICO)
                .orElseThrow(this::desafioNaoEncontrado);

        List<DesafioItem> itens = itemRepository.findAllByDesafioIdIn(List.of(id));
        Map<Long, List<DesafioItem>> itensPorDesafio = itens.stream()
                .collect(Collectors.groupingBy(DesafioItem::getDesafioId));

        Set<Long> catalogoIds = itens.stream().map(DesafioItem::getCatalogoId).collect(Collectors.toSet());
        Map<Long, CatalogoExercicio> catalogos = catalogoRepository.findAllById(catalogoIds).stream()
                .collect(Collectors.toMap(CatalogoExercicio::getId, Function.identity()));

        return DesafioMapper.toResponse(
                desafio, itensPorDesafio.getOrDefault(id, List.of()), catalogos, usuarioId);
    }

    @Transactional
    public DesafioResponseDTO update(Long usuarioId, Long id, DesafioRequestDTO request) {
        Desafio desafio = desafioRepository.findByIdAndEstado(id, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);

        if (!usuarioId.equals(desafio.getCriadorId())) {
            throw new AcessoNegadoException(
                    "DESAFIO_SOMENTE_CRIADOR", "Somente o criador pode atualizar o desafio");
        }

        validarPrazo(request.prazo());
        desafio.atualizar(request.titulo().trim(), request.prazo(), request.descricao(), request.visibilidade());
        desafioRepository.save(desafio);

        List<DesafioItem> itens = itemRepository.findAllByDesafioIdIn(List.of(id));
        Set<Long> catalogoIds = itens.stream().map(DesafioItem::getCatalogoId).collect(Collectors.toSet());
        Map<Long, CatalogoExercicio> catalogos = catalogoRepository.findAllById(catalogoIds).stream()
                .collect(Collectors.toMap(CatalogoExercicio::getId, Function.identity()));

        return DesafioMapper.toResponse(desafio, itens, catalogos, usuarioId);
    }

    private List<DesafioResponseDTO> montarRespostas(List<Desafio> desafios, Long usuarioId) {
        List<Long> desafioIds = desafios.stream().map(Desafio::getId).toList();
        List<DesafioItem> todosItens = itemRepository.findAllByDesafioIdIn(desafioIds);
        Map<Long, List<DesafioItem>> itensPorDesafio = todosItens.stream()
                .collect(Collectors.groupingBy(DesafioItem::getDesafioId));

        Set<Long> catalogoIds = todosItens.stream().map(DesafioItem::getCatalogoId).collect(Collectors.toSet());
        Map<Long, CatalogoExercicio> catalogos = catalogoRepository.findAllById(catalogoIds).stream()
                .collect(Collectors.toMap(CatalogoExercicio::getId, Function.identity()));

        return desafios.stream()
                .map(desafio -> DesafioMapper.toResponse(
                        desafio, itensPorDesafio.getOrDefault(desafio.getId(), List.of()), catalogos, usuarioId))
                .toList();
    }

    @Transactional
    public void delete(Long usuarioId, Long id) {
        Desafio desafio = desafioRepository.findByIdAndEstado(id, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);

        if (!usuarioId.equals(desafio.getCriadorId())) {
            boolean participa = participanteRepository
                    .existsByDesafioIdAndUsuarioIdAndEstadoNot(id, usuarioId, EstadoParticipante.RECUSADO);
            if (participa) {
                throw new AcessoNegadoException(
                        "DESAFIO_SOMENTE_CRIADOR", "Somente o criador pode remover o desafio");
            }
            throw desafioNaoEncontrado();
        }

        desafio.cancelar();
        desafioRepository.save(desafio);
    }

    // --- Participantes ---

    @Transactional(readOnly = true)
    public List<DesafioParticipanteResponseDTO> findParticipantes(Long usuarioId, Long desafioId) {
        Desafio desafio = desafioRepository.findCriadoOuPublicoPorId(
                desafioId, usuarioId, EstadoDesafio.ATIVO, Visibilidade.PUBLICO)
                .orElseThrow(this::desafioNaoEncontrado);

        List<DesafioParticipante> participantes = participanteRepository.findAllByDesafioId(desafioId);
        List<Long> usuarioIds = participantes.stream().map(DesafioParticipante::getUsuarioId).toList();
        Map<Long, Usuario> usuariosMap = usuarioRepository.findAllById(usuarioIds).stream()
                .collect(Collectors.toMap(Usuario::getId, Function.identity()));

        return participantes.stream()
                .map(p -> {
                    Usuario usuario = usuariosMap.get(p.getUsuarioId());
                    String email = usuario != null ? usuario.getEmail() : null;
                    return new DesafioParticipanteResponseDTO(
                            p.getUsuarioId(), email, p.getEstado(), p.getAceitoEm());
                })
                .toList();
    }

    @Transactional
    public DesafioParticipanteResponseDTO addParticipante(Long usuarioId, Long desafioId,
                                                          AdicionarParticipanteRequestDTO request) {
        Desafio desafio = desafioRepository.findByIdAndEstado(desafioId, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);

        if (!usuarioId.equals(desafio.getCriadorId())) {
            throw new AcessoNegadoException(
                    "DESAFIO_SOMENTE_CRIADOR", "Somente o criador pode adicionar participantes");
        }

        Long convidadoId = request.usuarioId();
        if (convidadoId.equals(usuarioId)) {
            throw new ConflitoException(
                    "CRIADOR_JA_PARTICIPANTE", "O criador já participa do desafio");
        }

        participanteRepository.findByDesafioIdAndUsuarioId(desafioId, convidadoId)
                .ifPresent(p -> {
                    if (p.getEstado() != EstadoParticipante.RECUSADO) {
                        throw new ConflitoException(
                                "PARTICIPANTE_JA_EXISTE", "Este usuário já participa ou foi convidado para o desafio");
                    }
                });

        Usuario usuario = usuarioRepository.findById(convidadoId)
                .orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário não encontrado"));

        DesafioParticipante participante = new DesafioParticipante();
        participante.setDesafioId(desafioId);
        participante.setUsuarioId(convidadoId);
        participante.setEstado(EstadoParticipante.CONVIDADO);
        participante = participanteRepository.save(participante);

        return new DesafioParticipanteResponseDTO(
                participante.getUsuarioId(), usuario.getEmail(), participante.getEstado(), participante.getAceitoEm());
    }

    @Transactional
    public DesafioParticipanteResponseDTO updateMinhaParticipacao(Long usuarioId, Long desafioId,
                                                                   ParticipanteUpdateRequestDTO request) {
        Desafio desafio = desafioRepository.findByIdAndEstado(desafioId, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);

        DesafioParticipante participante = participanteRepository.findByDesafioIdAndUsuarioId(desafioId, usuarioId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "NAO_PARTICIPANTE", "Você não participa deste desafio"));

        EstadoParticipante novoEstado = request.estado();
        if (novoEstado != EstadoParticipante.ACEITO && novoEstado != EstadoParticipante.RECUSADO) {
            throw new RequisicaoInvalidaException(
                    "ESTADO_INVALIDO", "O estado deve ser ACEITO ou RECUSADO");
        }

        participante.setEstado(novoEstado);
        if (novoEstado == EstadoParticipante.ACEITO) {
            participante.setAceitoEm(OffsetDateTime.now());
        }
        participante = participanteRepository.save(participante);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário não encontrado"));

        return new DesafioParticipanteResponseDTO(
                participante.getUsuarioId(), usuario.getEmail(), participante.getEstado(), participante.getAceitoEm());
    }

    @Transactional
    public void deleteMinhaParticipacao(Long usuarioId, Long desafioId) {
        Desafio desafio = desafioRepository.findByIdAndEstado(desafioId, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);

        if (usuarioId.equals(desafio.getCriadorId())) {
            throw new AcessoNegadoException(
                    "CRIADOR_NAO_SAI", "O criador não pode sair do desafio; cancele-o para removê-lo");
        }

        DesafioParticipante participante = participanteRepository.findByDesafioIdAndUsuarioId(desafioId, usuarioId)
                .orElseThrow(() -> new NaoEncontradoException(
                        "NAO_PARTICIPANTE", "Você não participa deste desafio"));

        participanteRepository.delete(participante);
    }

    private DesafioParticipante criadorComoParticipante(Long desafioId, Long usuarioId) {
        DesafioParticipante participante = new DesafioParticipante();
        participante.setDesafioId(desafioId);
        participante.setUsuarioId(usuarioId);
        participante.setEstado(EstadoParticipante.ACEITO);
        participante.setAceitoEm(OffsetDateTime.now());
        return participante;
    }

    private void validarPrazo(LocalDate prazo) {
        if (prazo.isBefore(LocalDate.now(FUSO))) {
            throw desafioInvalido("O prazo do desafio não pode estar no passado");
        }
    }

    private void validarItensRepetidos(List<DesafioItemRequestDTO> itens) {
        Set<Long> vistos = new HashSet<>();
        for (DesafioItemRequestDTO item : itens) {
            if (!vistos.add(item.catalogoId())) {
                throw desafioInvalido("O mesmo exercício não pode aparecer duas vezes no desafio");
            }
        }
    }

    private void validarMetas(Modalidade modalidade, DesafioItemRequestDTO item) {
        if (item.metaCargaKg() == null && item.metaRepeticoes() == null && item.metaSeries() == null
                && item.metaTempoS() == null && item.metaDistanciaM() == null) {
            throw desafioInvalido("Informe ao menos uma meta para cada exercício do desafio");
        }
        if (modalidade == Modalidade.MUSCULACAO) {
            if (item.metaDistanciaM() != null) {
                throw desafioInvalido("A meta de distância não se aplica a exercícios de musculação");
            }
        } else if (item.metaCargaKg() != null || item.metaSeries() != null || item.metaRepeticoes() != null) {
            throw desafioInvalido("Metas de carga, séries e repetições não se aplicam a exercícios aeróbicos");
        }
    }

    private NaoEncontradoException desafioNaoEncontrado() {
        return new NaoEncontradoException("DESAFIO_NAO_ENCONTRADO", "Desafio não encontrado");
    }

    private RequisicaoInvalidaException desafioInvalido(String mensagem) {
        return new RequisicaoInvalidaException("DESAFIO_INVALIDO", mensagem);
    }
}

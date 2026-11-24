package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.DesafioMapper;
import br.com.motivafit.dto.request.AdicionarParticipanteRequestDTO;
import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.request.ParticipanteUpdateRequestDTO;
import br.com.motivafit.dto.response.DesafioParticipanteResponseDTO;
import br.com.motivafit.dto.response.DesafioProgressoDTO;
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
import br.com.motivafit.repository.RegistroDiarioRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
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
    private final RegistroDiarioRepository registroRepository;

    public DesafioService(DesafioRepository desafioRepository,
                          DesafioItemRepository itemRepository,
                          DesafioParticipanteRepository participanteRepository,
                          CatalogoExercicioRepository catalogoRepository,
                          UsuarioRepository usuarioRepository,
                          RegistroDiarioRepository registroRepository) {
        this.desafioRepository = desafioRepository;
        this.itemRepository = itemRepository;
        this.participanteRepository = participanteRepository;
        this.catalogoRepository = catalogoRepository;
        this.usuarioRepository = usuarioRepository;
        this.registroRepository = registroRepository;
    }

    @Transactional
    public DesafioResponseDTO create(Long usuarioId, DesafioRequestDTO request) {
        validarPrazo(request.prazo());
        Map<Long, CatalogoExercicio> catalogos = validarItens(request.itens());

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
        List<Desafio> desafios = desafioRepository.findVisiveis(
                usuarioId, EstadoDesafio.ATIVO, Visibilidade.PUBLICO);
        if (desafios.isEmpty()) {
            return List.of();
        }

        return montarRespostas(desafios, usuarioId);
    }

    @Transactional(readOnly = true)
    public DesafioResponseDTO findById(Long usuarioId, Long id) {
        Desafio desafio = desafioRepository.findVisivelPorId(
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
        Map<Long, CatalogoExercicio> catalogos = validarItens(request.itens());
        desafio.atualizar(request.titulo().trim(), request.prazo(), request.descricao(), request.visibilidade());
        desafioRepository.save(desafio);

        // Os itens enviados substituem os anteriores; registros de execução não dependem deles.
        itemRepository.deleteAllByDesafioId(id);
        itemRepository.flush();
        List<DesafioItem> itens = itemRepository.saveAll(request.itens().stream()
                .map(item -> DesafioMapper.toItemEntity(id, item))
                .toList());

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
        Desafio desafio = desafioRepository.findVisivelPorId(
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

    /**
     * Entrada direta em desafio público. Um convite pendente ou recusado passa a aceito.
     */
    @Transactional
    public DesafioParticipanteResponseDTO entrar(Long usuarioId, Long desafioId) {
        Desafio desafio = desafioRepository.findByIdAndEstado(desafioId, EstadoDesafio.ATIVO)
                .orElseThrow(this::desafioNaoEncontrado);
        if (desafio.getVisibilidade() != Visibilidade.PUBLICO) {
            throw desafioNaoEncontrado();
        }
        DesafioParticipante participante = participanteRepository.findByDesafioIdAndUsuarioId(desafioId, usuarioId)
                .orElseGet(() -> {
                    DesafioParticipante novo = new DesafioParticipante();
                    novo.setDesafioId(desafioId);
                    novo.setUsuarioId(usuarioId);
                    return novo;
                });
        if (participante.getEstado() == EstadoParticipante.ACEITO) {
            throw new ConflitoException("PARTICIPANTE_JA_EXISTE", "Você já participa deste desafio");
        }
        participante.setEstado(EstadoParticipante.ACEITO);
        participante.setAceitoEm(OffsetDateTime.now());
        participante = participanteRepository.save(participante);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("USUARIO_NAO_ENCONTRADO", "Usuário não encontrado"));
        return new DesafioParticipanteResponseDTO(
                participante.getUsuarioId(), usuario.getEmail(), participante.getEstado(), participante.getAceitoEm());
    }

    /**
     * Progresso dos participantes que aceitaram o desafio, somando os registros feitos desde a criação
     * do desafio até o fim do último dia do prazo (fuso America/Sao_Paulo). Carga usa o máximo; os demais
     * valores são acumulados.
     */
    @Transactional(readOnly = true)
    public List<DesafioProgressoDTO> progresso(Long usuarioId, Long desafioId) {
        Desafio desafio = desafioRepository.findVisivelPorId(
                desafioId, usuarioId, EstadoDesafio.ATIVO, Visibilidade.PUBLICO)
                .orElseThrow(this::desafioNaoEncontrado);
        List<DesafioItem> itens = itemRepository.findAllByDesafioId(desafioId);
        List<DesafioParticipante> aceitos = participanteRepository.findAllByDesafioId(desafioId).stream()
                .filter(p -> p.getEstado() == EstadoParticipante.ACEITO)
                .toList();
        if (itens.isEmpty() || aceitos.isEmpty()) {
            return List.of();
        }

        List<Long> usuarioIds = aceitos.stream().map(DesafioParticipante::getUsuarioId).toList();
        List<Long> catalogoIds = itens.stream().map(DesafioItem::getCatalogoId).toList();
        OffsetDateTime inicio = desafio.getCreatedAt() != null ? desafio.getCreatedAt()
                : desafio.getPrazo().atStartOfDay(FUSO).toOffsetDateTime();
        OffsetDateTime fim = desafio.getPrazo().plusDays(1).atStartOfDay(FUSO).toOffsetDateTime();

        Map<String, Object[]> somas = new HashMap<>();
        for (Object[] linha : registroRepository.somarPorUsuarioECatalogo(usuarioIds, catalogoIds, inicio, fim)) {
            somas.put(linha[0] + ":" + linha[1], linha);
        }
        Map<Long, String> emails = usuarioRepository.findAllById(usuarioIds).stream()
                .collect(Collectors.toMap(Usuario::getId, Usuario::getEmail));

        return aceitos.stream().map(participante -> {
            List<DesafioProgressoDTO.Item> progressoItens = itens.stream()
                    .map(item -> progressoDoItem(item, somas.get(participante.getUsuarioId() + ":" + item.getCatalogoId())))
                    .toList();
            BigDecimal percentual = media(progressoItens.stream().map(DesafioProgressoDTO.Item::percentual).toList());
            boolean concluido = progressoItens.stream().allMatch(DesafioProgressoDTO.Item::concluido);
            return new DesafioProgressoDTO(participante.getUsuarioId(), emails.get(participante.getUsuarioId()),
                    percentual, concluido, progressoItens);
        }).sorted(Comparator.comparing(DesafioProgressoDTO::percentual).reversed()
                .thenComparing(DesafioProgressoDTO::usuarioId)).toList();
    }

    private DesafioProgressoDTO.Item progressoDoItem(DesafioItem item, Object[] soma) {
        BigDecimal carga = soma == null || soma[2] == null ? null : new BigDecimal(soma[2].toString());
        long repeticoes = soma == null ? 0 : ((Number) soma[3]).longValue();
        long series = soma == null ? 0 : ((Number) soma[4]).longValue();
        long tempo = soma == null ? 0 : ((Number) soma[5]).longValue();
        BigDecimal distancia = soma == null || soma[6] == null ? BigDecimal.ZERO : new BigDecimal(soma[6].toString());

        List<BigDecimal> percentuais = new ArrayList<>();
        if (item.getMetaCargaKg() != null) percentuais.add(percentual(carga == null ? BigDecimal.ZERO : carga, item.getMetaCargaKg()));
        if (item.getMetaRepeticoes() != null) percentuais.add(percentual(BigDecimal.valueOf(repeticoes), BigDecimal.valueOf(item.getMetaRepeticoes())));
        if (item.getMetaSeries() != null) percentuais.add(percentual(BigDecimal.valueOf(series), BigDecimal.valueOf(item.getMetaSeries())));
        if (item.getMetaTempoS() != null) percentuais.add(percentual(BigDecimal.valueOf(tempo), BigDecimal.valueOf(item.getMetaTempoS())));
        if (item.getMetaDistanciaM() != null) percentuais.add(percentual(distancia, item.getMetaDistanciaM()));

        boolean concluido = !percentuais.isEmpty() && percentuais.stream().allMatch(p -> p.compareTo(CEM) >= 0);
        return new DesafioProgressoDTO.Item(item.getId(), item.getCatalogoId(), carga, repeticoes, series, tempo,
                distancia, media(percentuais), concluido);
    }

    private static final BigDecimal CEM = BigDecimal.valueOf(100);

    private static BigDecimal percentual(BigDecimal atual, BigDecimal meta) {
        if (meta.signum() <= 0) {
            return CEM;
        }
        return atual.multiply(CEM).divide(meta, 2, RoundingMode.HALF_UP).min(CEM);
    }

    private static BigDecimal media(List<BigDecimal> valores) {
        if (valores.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(valores.size()), 2, RoundingMode.HALF_UP);
    }

    private Map<Long, CatalogoExercicio> validarItens(List<DesafioItemRequestDTO> itens) {
        validarItensRepetidos(itens);
        Map<Long, CatalogoExercicio> catalogos = new HashMap<>();
        for (DesafioItemRequestDTO item : itens) {
            CatalogoExercicio catalogo = catalogoRepository.findByIdAndAtivoTrue(item.catalogoId())
                    .orElseThrow(() -> new NaoEncontradoException(
                            "EXERCICIO_NAO_ENCONTRADO", "Exercício não encontrado"));
            validarMetas(catalogo.getModalidade(), item);
            catalogos.put(catalogo.getId(), catalogo);
        }
        return catalogos;
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

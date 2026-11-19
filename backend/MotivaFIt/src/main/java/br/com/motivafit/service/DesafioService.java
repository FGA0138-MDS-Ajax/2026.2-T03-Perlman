package br.com.motivafit.service;

import br.com.motivafit.dto.mapper.DesafioMapper;
import br.com.motivafit.dto.request.DesafioItemRequestDTO;
import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.CatalogoExercicio;
import br.com.motivafit.entity.Desafio;
import br.com.motivafit.entity.DesafioItem;
import br.com.motivafit.entity.DesafioParticipante;
import br.com.motivafit.enums.EstadoDesafio;
import br.com.motivafit.enums.EstadoParticipante;
import br.com.motivafit.enums.Modalidade;
import br.com.motivafit.exception.AcessoNegadoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.CatalogoExercicioRepository;
import br.com.motivafit.repository.DesafioItemRepository;
import br.com.motivafit.repository.DesafioParticipanteRepository;
import br.com.motivafit.repository.DesafioRepository;
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

    public DesafioService(DesafioRepository desafioRepository,
                          DesafioItemRepository itemRepository,
                          DesafioParticipanteRepository participanteRepository,
                          CatalogoExercicioRepository catalogoRepository) {
        this.desafioRepository = desafioRepository;
        this.itemRepository = itemRepository;
        this.participanteRepository = participanteRepository;
        this.catalogoRepository = catalogoRepository;
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

        Desafio desafio = desafioRepository.saveAndFlush(
                new Desafio(usuarioId, request.titulo().trim(), request.prazo()));
        List<DesafioItem> itens = itemRepository.saveAll(request.itens().stream()
                .map(item -> DesafioMapper.toItemEntity(desafio.getId(), item))
                .toList());
        participanteRepository.save(criadorComoParticipante(desafio.getId(), usuarioId));

        return DesafioMapper.toResponse(desafio, itens, catalogos, usuarioId);
    }

    @Transactional(readOnly = true)
    public List<DesafioResponseDTO> findAll(Long usuarioId) {
        List<Desafio> desafios = desafioRepository.findVisiveisDoUsuario(
                usuarioId, EstadoDesafio.ATIVO, EstadoParticipante.RECUSADO);
        if (desafios.isEmpty()) {
            return List.of();
        }

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
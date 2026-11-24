package br.com.motivafit.service;

import br.com.motivafit.dto.response.AdminTreinoDTO;
import br.com.motivafit.dto.response.PaginaDTO;
import br.com.motivafit.entity.Treino;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.TreinoRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminTreinoService {
    static final int TAMANHO_MAXIMO = 100;

    private final TreinoRepository treinoRepository;
    private final UsuarioRepository usuarioRepository;

    public AdminTreinoService(TreinoRepository treinoRepository, UsuarioRepository usuarioRepository) {
        this.treinoRepository = treinoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /** Lista os treinos não excluídos de todas as contas, do mais recente ao mais antigo. */
    @Transactional(readOnly = true)
    public PaginaDTO<AdminTreinoDTO> listar(int pagina, int tamanho) {
        if (pagina < 0 || tamanho < 1 || tamanho > TAMANHO_MAXIMO) {
            throw new RequisicaoInvalidaException("PAGINA_INVALIDA",
                    "A página deve ser maior ou igual a 0 e o tamanho deve estar entre 1 e " + TAMANHO_MAXIMO);
        }
        Page<Treino> resultado = treinoRepository.findAllByExcluidoEmIsNull(
                PageRequest.of(pagina, tamanho, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))));
        Map<Long, String> emails = usuarioRepository.findAllById(
                        resultado.getContent().stream().map(Treino::getUsuarioId).distinct().toList())
                .stream().collect(Collectors.toMap(Usuario::getId, Usuario::getEmail));
        return new PaginaDTO<>(resultado.getContent().stream()
                .map(treino -> new AdminTreinoDTO(treino.getId(), treino.getNome(), treino.getTipo(), treino.getVisibilidade(),
                        treino.getUsuarioId(), emails.get(treino.getUsuarioId()), treino.getTreinoOrigemId(), treino.getCreatedAt()))
                .toList(), resultado.getTotalElements(), pagina, tamanho);
    }
}

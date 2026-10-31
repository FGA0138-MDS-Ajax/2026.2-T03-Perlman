package br.com.motivafit.service;

import br.com.motivafit.dto.request.AceitarConviteRequestDTO;
import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.dto.response.ConviteCriado;
import br.com.motivafit.entity.ConviteAdmin;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Estado;
import br.com.motivafit.exception.ConflitoException;
import br.com.motivafit.exception.ErroInternoException;
import br.com.motivafit.exception.NaoEncontradoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;
import br.com.motivafit.repository.ConviteAdminRepository;
import br.com.motivafit.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class AdminService {
    private final UsuarioRepository usuarioRepository;
    private final ConviteAdminRepository conviteAdminRepository;
    private static final String MSG_CONVITE_INVALIDO = "Convite inválido ou expirado.";
    private static final int TOKEN_BYTES = 32;
    private final SecureRandom secureRandom = new SecureRandom();

    public AdminService(UsuarioRepository usuarioRepository, ConviteAdminRepository conviteAdminRepository) {
        this.usuarioRepository = usuarioRepository;
        this.conviteAdminRepository = conviteAdminRepository;
    }

    @Transactional
    public ConviteCriado criarConvite(ConviteAdminRequestDTO body) {
        Usuario convidador = usuarioRepository.findById(body.convidadorId())
                .orElseThrow(() -> new NaoEncontradoException(
                        "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado."));

        String email = normalizar(body.email());
        Instant agora = Instant.now();

        conviteAdminRepository.findPendentePorEmail(email).ifPresent(existente -> {
            if (existente.expirou(agora)) {
                existente.expirar();
                conviteAdminRepository.flush();
            } else {
                throw new ConflitoException(
                        "CONVITE_PENDENTE_JA_EXISTE", "Já existe um convite pendente para este e-mail.");
            }
        });

        String token = gerarToken();
        ConviteAdmin entity = new ConviteAdmin();
        entity.setConvidador(convidador);
        entity.setEmail(body.email());
        entity.setEstado(Estado.PENDENTE);
        entity.setExpiraEm(agora.plus(Duration.ofDays(7)));
        entity.setTokenHash(hash(token));
        ConviteAdmin convite = conviteAdminRepository.save(entity);

        return new ConviteCriado(convite.getId(), convite.getEmail(), token, convite.getExpiraEm());
    }


    @Transactional
    public void aceitarConvite(AceitarConviteRequestDTO body) {
        Usuario usuario = usuarioRepository.findById(body.usuarioId())
                .orElseThrow(() -> new NaoEncontradoException(
                        "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado."));

        ConviteAdmin convite = conviteAdminRepository.findByTokenHash(hash(body.token()))
                .orElseThrow(() -> conviteInvalido());

        try {
            convite.aceitar(usuario.getEmail(), Instant.now());
        } catch (ConflitoException e) {
            throw conviteInvalido();
        }

        usuario.promoverParaAdministrador();
    }

    private String gerarToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new ErroInternoException("HASH_INDISPONIVEL", "SHA-256 indisponível.");
        }
    }

    private static String normalizar(String email) {
        return email.trim().toLowerCase();
    }

    private static RequisicaoInvalidaException conviteInvalido() {
        return new RequisicaoInvalidaException("CONVITE_INVALIDO", MSG_CONVITE_INVALIDO);
    }
}

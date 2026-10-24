package br.com.motivafit.service;

import br.com.motivafit.dto.request.LoginRequestDTO;
import br.com.motivafit.dto.response.LoginResponseDTO;
import br.com.motivafit.entity.RefreshToken;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.repository.RefreshTokenRepository;
import br.com.motivafit.repository.UsuarioRepository;
import br.com.motivafit.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.UUID;

@Service
public class LoginService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokens;

    public LoginService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder,
                        JwtService jwtService, RefreshTokenRepository refreshTokens) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokens = refreshTokens;
    }

    @Transactional
    public LoginResult login(LoginRequestDTO body) {
        Usuario usuario = usuarios.findByEmail(body.email())
                .filter(u -> u.getAtivo() != null && u.getAtivo())
                .filter(u -> passwordEncoder.matches(body.senha(), u.getSenhaHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha incorretos"));

        String refreshToken = jwtService.gerarRefreshToken();
        salvarRefresh(refreshToken, usuario, UUID.randomUUID().toString());
        return new LoginResult(resposta(usuario), refreshToken);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public LoginResult refresh(String rawToken) {
        RefreshToken atual = localizar(rawToken);
        if (atual.getRevogacao() != null || !atual.getValidade().after(new Date())) {
            revogarFamilia(atual.getFamilia());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido ou expirado");
        }
        if (atual.getUsuarioId().getAtivo() == null || !atual.getUsuarioId().getAtivo()) {
            revogarFamilia(atual.getFamilia());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta inativa");
        }

        revogar(atual);
        String novoRefresh = jwtService.gerarRefreshToken();
        salvarRefresh(novoRefresh, atual.getUsuarioId(), atual.getFamilia());
        return new LoginResult(resposta(atual.getUsuarioId()), novoRefresh);
    }

    @Transactional
    public void logout(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) return;
        RefreshToken atual = refreshTokens.findByHash(jwtService.hashRefreshToken(rawToken))
                .orElse(null);
        if (atual != null) revogarFamilia(atual.getFamilia());
    }

    private LoginResponseDTO resposta(Usuario usuario) {
        String accessToken = jwtService.gerarToken(usuario);
        return new LoginResponseDTO(accessToken, jwtService.extractExpiration(accessToken));
    }

    private RefreshToken localizar(String rawToken) {
        if (rawToken == null || rawToken.isBlank())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token ausente");
        return refreshTokens.findByHash(jwtService.hashRefreshToken(rawToken))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token inválido"));
    }

    private void salvarRefresh(String rawToken, Usuario usuario, String familia) {
        RefreshToken entidade = new RefreshToken();
        entidade.setHash(jwtService.hashRefreshToken(rawToken));
        entidade.setValidade(jwtService.refreshExpiration());
        entidade.setUsuarioId(usuario);
        entidade.setFamilia(familia);
        refreshTokens.save(entidade);
    }

    private void revogar(RefreshToken token) {
        token.setRevogacao(new Date());
        refreshTokens.save(token);
    }

    private void revogarFamilia(String familia) {
        Date agora = new Date();
        refreshTokens.findByFamilia(familia).stream()
                .filter(t -> t.getRevogacao() == null)
                .forEach(t -> t.setRevogacao(agora));
    }

    public record LoginResult(LoginResponseDTO response, String refreshToken) {}
}

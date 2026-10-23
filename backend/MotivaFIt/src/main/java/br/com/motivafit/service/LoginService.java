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

@Service
public class LoginService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService token;
    private final RefreshTokenRepository refreshTokenRepository;

    public LoginService(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtService token, RefreshTokenRepository refreshTokenRepository) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.token = token;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public LoginResponseDTO login(LoginRequestDTO body){
        try {
            Usuario usuarioEntity = repository.findByEmail(body.email()).orElseThrow(() -> new IllegalArgumentException("Email ou senha incorretos"));
            if(!passwordEncoder.matches(body.senha(), usuarioEntity.getSenhaHash())) throw new IllegalArgumentException("Email ou senha incorretos");

            String jwtToken = token.gerarToken(usuarioEntity);
            String refrshToken = token.gerarRefrshToken(usuarioEntity);

            RefreshToken refreshTokenEntity = new RefreshToken();
            refreshTokenEntity.setHash(refrshToken);
            refreshTokenEntity.setValidade(token.extractExpiration(refrshToken));
            refreshTokenEntity.setUsuarioId(usuarioEntity);
            refreshTokenEntity.setFamilia("Refresh");
            refreshTokenRepository.save(refreshTokenEntity);

            return new LoginResponseDTO(jwtToken, refrshToken, token.extractExpiration(jwtToken));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

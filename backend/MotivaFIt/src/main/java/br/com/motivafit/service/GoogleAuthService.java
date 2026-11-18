package br.com.motivafit.service;

import br.com.motivafit.dto.request.GoogleLoginRequestDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.enums.Perfil;
import br.com.motivafit.repository.UsuarioRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.motivafit.exception.NaoAutorizadoException;

import java.util.Collections;

@Service
public class GoogleAuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginService loginService;
    private final String googleClientId;

    public GoogleAuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            LoginService loginService,
            @Value("${security.google.client-id:}") String googleClientId) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginService = loginService;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public LoginService.LoginResult login(GoogleLoginRequestDTO request) {
        GoogleIdToken.Payload payload = validarGoogleIdToken(request.idToken());

        String email = payload.getEmail();
        if (email == null) {
            throw new NaoAutorizadoException("GOOGLE_EMAIL_AUSENTE", "E-mail não encontrado no token do Google");
        }

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseGet(() -> criarUsuarioGoogle(email, payload.getEmailVerified()));

        if (usuario.getAtivo() == null || !usuario.getAtivo()) {
            throw new NaoAutorizadoException("CONTA_INATIVA", "A conta está inativa");
        }

        return loginService.loginComUsuario(usuario);
    }

    GoogleIdToken.Payload validarGoogleIdToken(String idTokenString) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken token = verifier.verify(idTokenString);
        if (token == null) {
            throw new NaoAutorizadoException("GOOGLE_TOKEN_INVALIDO", "Token do Google inválido");
        }
        return token.getPayload();
    }

    private Usuario criarUsuarioGoogle(String email, Boolean emailVerified) {
        Usuario usuario = new Usuario();
        usuario.setEmail(email);
        usuario.setAtivo(true);
        usuario.setPerfil(Perfil.USUARIO);
        // Senha placeholder que não será usada para login por senha
        usuario.setSenhaHash(passwordEncoder.encode("{GOOGLE}"));
        return usuarioRepository.save(usuario);
    }
}

package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.security.SecureRandom;
import java.util.Base64;
import br.com.motivafit.exception.ErroInternoException;
import br.com.motivafit.exception.RequisicaoInvalidaException;


@Service
public class JwtService {
    private final SecretKey signingKey;
    private final String issuer;
    private final long expirationMinutes;
    private final long expirationDays;
    private final SecureRandom secureRandom = new SecureRandom();

    public JwtService(
            @Value("${security.jwt.secret-key}") String secretKey,
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.expiration-minutes}") long expirationMinutes,
            @Value("${security.jwt.refresh-expiration-days}") long expirationDays
    ) {
        this.signingKey = criarChave(secretKey);
        if (expirationMinutes <= 0) {
            throw new RequisicaoInvalidaException("CONFIGURACAO_JWT_INVALIDA", "A validade do token de acesso deve ser maior que zero");
        }
        if (expirationDays <= 0) {
            throw new RequisicaoInvalidaException("CONFIGURACAO_JWT_INVALIDA", "A validade do token de renovação deve ser maior que zero");
        }
        this.issuer = issuer;
        this.expirationMinutes = expirationMinutes;
        this.expirationDays = expirationDays;
    }

    public String gerarToken(Usuario usuario) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", usuario.getId());
        claims.put("ativo", usuario.getAtivo());
        claims.put("perfil", usuario.getPerfil());
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .claims(claims)
                .issuer(issuer)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String gerarRefreshToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefreshToken(String refreshToken) {
        try {
            byte[] digest = java.security.MessageDigest.getInstance("SHA-256")
                    .digest(refreshToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new ErroInternoException("HASH_INDISPONIVEL", "Não foi possível processar o token de renovação");
        }
    }

    public Date refreshExpiration() {
        return Date.from(Instant.now().plus(expirationDays, ChronoUnit.DAYS));
    }

    /**
     * Monta a chave HS256 na inicialização, com o mesmo decodificador usado para assinar. Assim, uma
     * JWT_SECRET inválida impede a aplicação de subir, em vez de falhar só no primeiro login.
     */
    private static SecretKey criarChave(String secretKey) {
        String mensagem = "A chave JWT (JWT_SECRET) deve estar em Base64 e ter pelo menos 32 bytes (256 bits) "
                + "depois de decodificada. Gere uma com: openssl rand -base64 48";
        if (secretKey == null || secretKey.isBlank()) {
            throw new RequisicaoInvalidaException("CONFIGURACAO_JWT_INVALIDA", mensagem);
        }
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey.trim()));
        } catch (DecodingException | WeakKeyException erro) {
            throw new RequisicaoInvalidaException("CONFIGURACAO_JWT_INVALIDA", mensagem);
        }
    }

    private SecretKey getSignInKey() {
        return signingKey;
    }

    public Date extractExpiration(String token){
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();
    }

    public String extractEmail(String token){
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token);

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Falha na validação do JWT: " + e.getMessage());
            return false;
        }
    }
}

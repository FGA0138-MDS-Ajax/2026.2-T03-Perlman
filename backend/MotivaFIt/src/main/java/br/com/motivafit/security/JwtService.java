package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
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


@Service
public class JwtService {
    private final String secretKey;
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
        if (secretKey.length() < 32) {
            throw new IllegalStateException("security.jwt.secret deve possuir pelo menos 32 caracteres");
        }
        if (expirationMinutes <= 0) {
            throw new IllegalStateException("security.jwt.expiration-minutes deve ser maior que zero");
        }
        this.secretKey = secretKey;
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
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }

    public Date refreshExpiration() {
        return Date.from(Instant.now().plus(expirationDays, ChronoUnit.DAYS));
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
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

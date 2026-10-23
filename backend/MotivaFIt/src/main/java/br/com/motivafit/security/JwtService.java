package br.com.motivafit.security;

import br.com.motivafit.entity.Usuario;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import io.jsonwebtoken.Jwts;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;


@Service
public class JwtService {
    private final String secretKey;
    private final String issuer;
    private final long expirationMinutes;

    public JwtService(
            @Value("${security.jwt.secret-key}") String secretKey,
            @Value("${security.jwt.issuer}") String issuer,
            @Value("${security.jwt.expiration-minutes}") long expirationMinutes
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
    }

    public String gerarToken(Usuario usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.getEmail())
                .issuer(issuer)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(getSignInKey(), Jwts.SIG.HS256)
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
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


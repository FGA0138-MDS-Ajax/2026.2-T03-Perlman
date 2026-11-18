package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;

public abstract class ErroAplicacaoException extends RuntimeException {
    private final String codigo;
    private final HttpStatus status;
    private final OffsetDateTime dataHora;

    protected ErroAplicacaoException(String codigo, String mensagem, HttpStatus status) {
        super(mensagem);
        this.codigo = codigo;
        this.status = status;
        this.dataHora = OffsetDateTime.now();
    }

    public String getCodigo() { return codigo; }
    public HttpStatus getStatus() { return status; }
    public OffsetDateTime getDataHora() { return dataHora; }
}

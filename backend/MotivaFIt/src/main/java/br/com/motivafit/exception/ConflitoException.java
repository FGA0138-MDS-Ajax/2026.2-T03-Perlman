package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class ConflitoException extends ErroAplicacaoException {
    public ConflitoException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.CONFLICT);
    }
}

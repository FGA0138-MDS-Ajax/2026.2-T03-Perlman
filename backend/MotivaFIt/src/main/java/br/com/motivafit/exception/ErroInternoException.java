package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class ErroInternoException extends ErroAplicacaoException {
    public ErroInternoException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

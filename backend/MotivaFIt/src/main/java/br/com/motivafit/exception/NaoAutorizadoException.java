package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class NaoAutorizadoException extends ErroAplicacaoException {
    public NaoAutorizadoException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.UNAUTHORIZED);
    }
}

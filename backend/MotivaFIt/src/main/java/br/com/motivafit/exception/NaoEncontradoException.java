package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class NaoEncontradoException extends ErroAplicacaoException {
    public NaoEncontradoException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.NOT_FOUND);
    }
}
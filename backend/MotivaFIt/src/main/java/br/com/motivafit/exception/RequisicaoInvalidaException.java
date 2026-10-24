package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class RequisicaoInvalidaException extends ErroAplicacaoException {
    public RequisicaoInvalidaException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.BAD_REQUEST);
    }
}

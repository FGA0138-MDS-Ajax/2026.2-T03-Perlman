package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;

public class AcessoNegadoException extends ErroAplicacaoException {
    public AcessoNegadoException(String codigo, String mensagem) {
        super(codigo, mensagem, HttpStatus.FORBIDDEN);
    }
}

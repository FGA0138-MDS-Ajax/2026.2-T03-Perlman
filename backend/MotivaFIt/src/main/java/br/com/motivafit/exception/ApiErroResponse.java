package br.com.motivafit.exception;

import java.time.OffsetDateTime;

public record ApiErroResponse(String codigo, String mensagem, OffsetDateTime dataHora) {
    public static ApiErroResponse de(ErroAplicacaoException erro) {
        return new ApiErroResponse(erro.getCodigo(), erro.getMessage(), erro.getDataHora());
    }
}

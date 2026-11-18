package br.com.motivafit.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;

class ExcecoesPersonalizadasTest {
    @Test
    void excecoesDefinemCodigoMensagemEStatus() {
        assertErro(new RequisicaoInvalidaException("BAD_REQUEST", "Requisição inválida"), HttpStatus.BAD_REQUEST);
        assertErro(new NaoAutorizadoException("UNAUTHORIZED", "Não autorizado"), HttpStatus.UNAUTHORIZED);
        assertErro(new AcessoNegadoException("FORBIDDEN", "Acesso negado"), HttpStatus.FORBIDDEN);
        assertErro(new ConflitoException("CONFLICT", "Conflito"), HttpStatus.CONFLICT);
        assertErro(new ErroInternoException("INTERNAL", "Erro interno"), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private void assertErro(ErroAplicacaoException erro, HttpStatus status) {
        assertNotNull(erro.getCodigo());
        assertNotNull(erro.getMessage());
        assertNotNull(erro.getDataHora());
        assertEquals(status, erro.getStatus());
        ApiErroResponse response = ApiErroResponse.de(erro);
        assertEquals(erro.getCodigo(), response.codigo());
        assertEquals(erro.getMessage(), response.mensagem());
        assertEquals(erro.getDataHora(), response.dataHora());
    }
}

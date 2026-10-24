package br.com.motivafit.exception;

import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.converter.HttpMessageNotReadableException;

import static org.junit.jupiter.api.Assertions.*;

class TratadorExcecoesTest {
    private final TratadorExcecoes handler = new TratadorExcecoes();

    @Test
    void trataExcecaoDeDominioComStatusCodigoMensagemETimestamp() {
        var exception = new ConflitoException("EMAIL_DUPLICADO", "E-mail já cadastrado");
        var response = handler.tratarErroAplicacao(exception);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("EMAIL_DUPLICADO", response.getBody().codigo());
        assertEquals("E-mail já cadastrado", response.getBody().mensagem());
        assertEquals(exception.getDataHora(), response.getBody().dataHora());
    }

    @Test
    void traduzErroDeValidacaoParaMensagemEmPortugues() throws Exception {
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult(new Object(), "body");
        binding.addError(new FieldError("body", "email", "E-mail é obrigatório"));
        MethodParameter parameter = new MethodParameter(getClass().getDeclaredMethod("metodoTeste"), -1);
        var response = handler.tratarValidacao(new MethodArgumentNotValidException(parameter, binding));

        assertEquals(400, response.getStatusCode().value());
        assertEquals("DADOS_INVALIDOS", response.getBody().codigo());
        assertEquals("E-mail é obrigatório", response.getBody().mensagem());
        assertNotNull(response.getBody().dataHora());
    }

    @Test
    void trataCorpoInvalidoEErroInesperadoSemExporDetalhes() {
        var badBody = handler.tratarCorpoInvalido(new HttpMessageNotReadableException(
                "bad json", new org.springframework.mock.http.MockHttpInputMessage(new byte[0])));
        assertEquals(400, badBody.getStatusCode().value());
        assertEquals("CORPO_INVALIDO", badBody.getBody().codigo());

        var unexpected = handler.tratarErroInesperado(new IllegalStateException("sensitive detail"));
        assertEquals(500, unexpected.getStatusCode().value());
        assertEquals("ERRO_INTERNO", unexpected.getBody().codigo());
        assertFalse(unexpected.getBody().mensagem().contains("sensitive detail"));
    }

    private void metodoTeste() { }
}

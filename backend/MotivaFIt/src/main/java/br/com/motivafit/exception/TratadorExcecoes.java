package br.com.motivafit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class TratadorExcecoes {
    @ExceptionHandler(ErroAplicacaoException.class)
    public ResponseEntity<ApiErroResponse> tratarErroAplicacao(ErroAplicacaoException erro) {
        return ResponseEntity.status(erro.getStatus()).body(ApiErroResponse.de(erro));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErroResponse> tratarValidacao(MethodArgumentNotValidException erro) {
        String mensagem = erro.getBindingResult().getFieldErrors().stream()
                .findFirst().map(error -> error.getDefaultMessage() == null
                        ? "Dados informados são inválidos" : error.getDefaultMessage())
                .orElse("Dados informados são inválidos");
        return responder(HttpStatus.BAD_REQUEST, "DADOS_INVALIDOS", mensagem);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErroResponse> tratarCorpoInvalido(HttpMessageNotReadableException erro) {
        return responder(HttpStatus.BAD_REQUEST, "CORPO_INVALIDO", "O corpo da requisição é inválido");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErroResponse> tratarErroInesperado(Exception erro) {
        ErroInternoException erroApi = new ErroInternoException(
                "ERRO_INTERNO", "Ocorreu um erro interno. Tente novamente mais tarde");
        return ResponseEntity.status(erroApi.getStatus()).body(ApiErroResponse.de(erroApi));
    }

    private ResponseEntity<ApiErroResponse> responder(HttpStatus status, String codigo, String mensagem) {
        return ResponseEntity.status(status)
                .body(new ApiErroResponse(codigo, mensagem, java.time.OffsetDateTime.now()));
    }
}

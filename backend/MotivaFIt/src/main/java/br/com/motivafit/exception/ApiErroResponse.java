package br.com.motivafit.exception;

import java.time.OffsetDateTime;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Formato padrão dos erros da API")
public record ApiErroResponse(
        @Schema(description = "Código estável para identificação do erro", example = "CREDENCIAIS_INVALIDAS")
        String codigo,
        @Schema(description = "Descrição do erro em português", example = "E-mail ou senha incorretos")
        String mensagem,
        @Schema(description = "Data e hora em que a exceção foi criada", type = "string", format = "date-time")
        OffsetDateTime dataHora) {
    public static ApiErroResponse de(ErroAplicacaoException erro) {
        return new ApiErroResponse(erro.getCodigo(), erro.getMessage(), erro.getDataHora());
    }
}

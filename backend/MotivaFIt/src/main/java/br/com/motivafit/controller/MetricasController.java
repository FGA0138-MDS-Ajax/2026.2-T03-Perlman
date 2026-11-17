package br.com.motivafit.controller;

import br.com.motivafit.dto.response.EvolucaoPontoDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.service.MetricasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/metricas")
@Tag(name = "Métricas")
@SecurityRequirement(name = "AccessToken")
public class MetricasController {
    private final MetricasService service;

    public MetricasController(MetricasService service) { this.service = service; }

    @GetMapping("/evolucao")
    @Operation(summary = "Consultar evolução pessoal", description = "Agrupa exclusivamente os registros do usuário autenticado. Pace é calculado em segundos por quilômetro sobre a soma de tempo e distância positiva.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pontos da evolução", content = @Content(array = @ArraySchema(schema = @Schema(implementation = EvolucaoPontoDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Parâmetros de período ou agrupamento inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public List<EvolucaoPontoDTO> evolucao(@AuthenticationPrincipal Usuario usuario,
                                           @Parameter(description = "Identificador opcional do exercício do catálogo", example = "1") @RequestParam(required = false) Long catalogoId,
                                           @Parameter(description = "Primeiro dia do período", example = "2026-10-19") @RequestParam(required = false) LocalDate de,
                                           @Parameter(description = "Último dia do período", example = "2026-11-17") @RequestParam(required = false) LocalDate ate,
                                           @Parameter(description = "Granularidade da série", example = "DIA") @RequestParam(defaultValue = "DIA") AgrupamentoEvolucao agrupamento) {
        return service.evolucao(usuario.getId(), catalogoId, de, ate, agrupamento);
    }
}

package br.com.motivafit.controller;

import br.com.motivafit.metricas.AgrupamentoEvolucao;
import br.com.motivafit.service.MetricasService;
import br.com.motivafit.exception.ApiErroResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/metricas")
@Tag(name = "Administração: métricas")
@SecurityRequirement(name = "AccessToken")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','SUPERUSUARIO')")
@ApiResponses({
        @ApiResponse(responseCode = "400", description = "Parâmetros inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
        @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
        @ApiResponse(responseCode = "403", description = "Acesso restrito a administradores", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
        @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
})
public class MetricasAdminController {
    private final MetricasService service;

    public MetricasAdminController(MetricasService service) { this.service = service; }

    @GetMapping("/usuarios-ativos")
    @Operation(summary = "Consultar usuários ativos", description = "Usuário ativo é uma conta elegível com ao menos um registro no período. A contagem do período inteiro é distinta e não corresponde à soma de uma eventual série.")
    public MetricasService.UsuariosAtivosDTO ativos(@RequestParam(required = false) LocalDate de,
                                                    @RequestParam(required = false) LocalDate ate,
                                                    @RequestParam(defaultValue = "DIA") AgrupamentoEvolucao agrupamento) {
        return service.ativos(de, ate, agrupamento);
    }

    @GetMapping("/frequencia-media")
    @Operation(summary = "Consultar frequência média", description = "Calcula dias distintos ativos por usuário e semana, considerando as semanas de ponta cortadas pelo intervalo informado.")
    public MetricasService.FrequenciaMediaDTO frequencia(@RequestParam(required = false) LocalDate de,
                                                         @RequestParam(required = false) LocalDate ate) {
        return service.frequenciaMedia(de, ate);
    }

    @GetMapping("/ranking-tempo-treino")
    @Operation(summary = "Consultar ranking agregado de tempo de treino", description = "Retorna apenas valores agregados. O ranking é ocultado quando há menos de cinco usuários ativos, preservando a privacidade.")
    public MetricasService.RankingTempoDTO ranking(@RequestParam(required = false) LocalDate de,
                                                   @RequestParam(required = false) LocalDate ate,
                                                   @RequestParam(defaultValue = "10") int limite) {
        return service.rankingTempo(de, ate, limite);
    }

    @GetMapping("/exercicios-mais-realizados")
    @Operation(summary = "Consultar exercícios mais realizados", description = "Ranking agregado por catálogo de exercício, sem identificadores de usuários.")
    public MetricasService.ExerciciosDTO exercicios(@RequestParam(required = false) LocalDate de,
                                                    @RequestParam(required = false) LocalDate ate,
                                                    @RequestParam(defaultValue = "10") int limite) {
        return service.exerciciosMaisRealizados(de, ate, limite);
    }

    @GetMapping("/rotinas")
    @Operation(summary = "Consultar métricas de rotinas", description = "Retorna contagens agregadas de treinos elegíveis e adições de treinos públicos.")
    public MetricasService.RotinasDTO rotinas(@RequestParam(required = false) LocalDate de,
                                              @RequestParam(required = false) LocalDate ate,
                                              @RequestParam(defaultValue = "10") int limite) {
        return service.rotinas(de, ate, limite);
    }

    @GetMapping("/retencao")
    @Operation(summary = "Consultar retenção por coorte", description = "Retenção por coorte semanal; histórico sem data de cadastro confiável não é inferido.")
    public MetricasService.RetencaoDTO retencao(@RequestParam(required = false) LocalDate ate,
                                                @RequestParam(defaultValue = "8") int coortes) {
        return service.retencao(ate, coortes);
    }
}

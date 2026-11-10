package br.com.motivafit.controller;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.ExercicioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treinos/{treinoId}/exercicios")
@Tag(name = "Exercícios do treino", description = "Exercícios associados à ficha de um treino")
@SecurityRequirement(name = "AccessToken")
public class ExercicioController {

    private final ExercicioService exercicioService;

    public ExercicioController(ExercicioService exercicioService) {
        this.exercicioService = exercicioService;
    }

    @GetMapping
    @Operation(summary = "Listar exercícios do treino", description = "Lista as associações de um treino próprio ou público, da inclusão mais antiga para a mais nova. Treino inexistente, excluído ou privado de outra pessoa retorna 404. Não há coluna de posição: a ordem é o id da associação.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exercícios da ficha", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ExercicioResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<ExercicioResponseDTO>> listar(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long treinoId) {
        return ResponseEntity.ok(exercicioService.listar(usuario.getId(), treinoId));
    }

    @PostMapping
    @Operation(summary = "Associar exercício ao treino", description = "Inclui um item ativo do catálogo na ficha do usuário autenticado. O treinoId do corpo precisa ser o mesmo da URL. Treino de outra pessoa, excluído ou item de catálogo inativo retorna 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Exercício associado", content = @Content(schema = @Schema(implementation = ExercicioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou treino divergente", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino ou item do catálogo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<ExercicioResponseDTO> adicionar(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long treinoId,
            @Valid @RequestBody ExercicioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(exercicioService.adicionar(usuario.getId(), treinoId, dto));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Alterar meta do exercício", description = "Altera meta e recorde de uma associação do treino do usuário. O item do catálogo permanece o mesmo. A associação precisa pertencer ao treino da URL.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exercício alterado", content = @Content(schema = @Schema(implementation = ExercicioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos, treino divergente ou catálogo trocado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino ou associação não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<ExercicioResponseDTO> alterar(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long treinoId,
            @Parameter(description = "Identificador da associação", example = "30") @PathVariable Long id,
            @Valid @RequestBody ExercicioRequestDTO dto) {
        return ResponseEntity.ok(exercicioService.alterar(usuario.getId(), treinoId, id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover exercício do treino", description = "Remove a associação da ficha do usuário. Registros diários anteriores permanecem: a referência ao exercício é anulada e o nome histórico fica gravado no registro.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Associação removida"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino ou associação não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> remover(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long treinoId,
            @Parameter(description = "Identificador da associação", example = "30") @PathVariable Long id) {
        exercicioService.remover(usuario.getId(), treinoId, id);
        return ResponseEntity.noContent().build();
    }
}

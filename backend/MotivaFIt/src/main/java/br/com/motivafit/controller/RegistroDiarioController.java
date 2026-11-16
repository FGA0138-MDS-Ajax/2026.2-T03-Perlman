package br.com.motivafit.controller;

import br.com.motivafit.dto.request.RegistroDiarioRequestDTO;
import br.com.motivafit.dto.response.RegistroDiarioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.RegistroDiarioService;
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
@RequestMapping("/api/registros")
@Tag(name = "Registros diários", description = "Registro das execuções de exercícios do usuário autenticado (histórico)")
@SecurityRequirement(name = "AccessToken")
public class RegistroDiarioController {

    private final RegistroDiarioService service;

    public RegistroDiarioController(RegistroDiarioService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Registrar execução de exercício", description = "Registra que o usuário autenticado executou um exercício do catálogo, com carga, repetições, séries, tempo e/ou distância conforme a modalidade. Treino e exercício do treino são opcionais, mas precisam ser do próprio usuário.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Execução registrada (ou registro original, se a chave de idempotência já foi usada)", content = @Content(schema = @Schema(implementation = RegistroDiarioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos para a modalidade do exercício", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Exercício do catálogo, treino ou exercício do treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<RegistroDiarioResponseDTO> create(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody RegistroDiarioRequestDTO request) {
        var dto = service.create(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    @Operation(summary = "Listar registros", description = "Lista o histórico do usuário autenticado, do mais recente para o mais antigo. Paginado: tamanho padrão 50 e máximo 100.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registros do usuário (lista vazia se não houver)", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegistroDiarioResponseDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Parâmetro de página inválido", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<RegistroDiarioResponseDTO>> findAll(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Número da página, começando em 0", example = "0")
            @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Itens por página (1 a 100)", example = "50")
            @RequestParam(defaultValue = "50") int tamanho) {
        return ResponseEntity.ok(service.findAll(usuario.getId(), pagina, tamanho));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar registro por id", description = "Retorna um registro do histórico do usuário autenticado. Registros de outros usuários são tratados como inexistentes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registro encontrado", content = @Content(schema = @Schema(implementation = RegistroDiarioResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado para o usuário autenticado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<RegistroDiarioResponseDTO> findById(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do registro", example = "101") @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuario.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar registro", description = "Atualiza os dados da execução do registro do usuário autenticado. O exercício do catálogo não pode ser alterado; registros de outros usuários são tratados como inexistentes.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Registro atualizado", content = @Content(schema = @Schema(implementation = RegistroDiarioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou exercício do catálogo alterado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Registro, exercício, treino ou exercício do treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<RegistroDiarioResponseDTO> update(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do registro", example = "101") @PathVariable Long id,
            @Valid @RequestBody RegistroDiarioRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir registro", description = "Exclui permanentemente um registro do histórico pertencente ao usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Registro excluído"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Registro não encontrado para o usuário autenticado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> delete(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do registro", example = "101") @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

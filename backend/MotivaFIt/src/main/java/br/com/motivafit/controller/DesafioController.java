package br.com.motivafit.controller;

import br.com.motivafit.dto.request.DesafioRequestDTO;
import br.com.motivafit.dto.response.DesafioResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.DesafioService;
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
@RequestMapping("/api/desafios")
@Tag(name = "Desafios", description = "Desafios: lista de exercícios do catálogo com metas numéricas e prazo, para o usuário e seus amigos")
@SecurityRequirement(name = "AccessToken")
public class DesafioController {

    private final DesafioService service;

    public DesafioController(DesafioService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Criar desafio", description = "Cria um desafio com exercícios do catálogo, metas numéricas e prazo. O usuário autenticado vira o criador e já participa do desafio. Cada exercício precisa de ao menos uma meta, compatível com a modalidade.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Desafio criado", content = @Content(schema = @Schema(implementation = DesafioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos (prazo no passado, exercício repetido, metas incompatíveis com a modalidade)", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Exercício do catálogo não encontrado ou desativado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<DesafioResponseDTO> create(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody DesafioRequestDTO request) {
        var dto = service.create(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    @Operation(summary = "Listar desafios", description = "Lista os desafios ativos criados pelo usuário autenticado e os desafios públicos ativos, do prazo mais próximo para o mais distante.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Desafios visíveis (lista vazia se não houver)", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DesafioResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<DesafioResponseDTO>> findAll(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.findAll(usuario.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter desafio", description = "Retorna um desafio específico se for criado pelo usuário autenticado ou for público.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Desafio encontrado", content = @Content(schema = @Schema(implementation = DesafioResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Desafio não encontrado ou não visível", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<DesafioResponseDTO> findById(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do desafio", example = "7") @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuario.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar desafio", description = "Atualiza um desafio criado pelo usuário autenticado. Somente o criador pode atualizar.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Desafio atualizado", content = @Content(schema = @Schema(implementation = DesafioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não é o criador do desafio", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Desafio não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<DesafioResponseDTO> update(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do desafio", example = "7") @PathVariable Long id,
            @Valid @RequestBody DesafioRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover desafio", description = "Cancela um desafio criado pelo usuário autenticado. Os registros de execução já feitos são preservados. Quem participa mas não é o criador recebe 403.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Desafio removido"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário participa do desafio, mas não é o criador", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Desafio não encontrado, já removido ou sem participação do usuário", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> delete(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do desafio", example = "7") @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

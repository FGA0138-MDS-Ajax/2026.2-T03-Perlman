package br.com.motivafit.controller;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.TreinoService;
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
@RequestMapping("/api/treinos")
@Tag(name = "Treinos", description = "Cadastro, listagem, alteração e exclusão dos treinos do usuário autenticado")
@SecurityRequirement(name = "AccessToken")
public class TreinoController {

    private final TreinoService service;

    public TreinoController(TreinoService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Cadastrar treino", description = "Cria um treino para o usuário autenticado. Se a visibilidade não for informada, o treino é PRIVADO.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Treino criado", content = @Content(schema = @Schema(implementation = TreinoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<TreinoResponseDTO> create(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody TreinoRequestDTO request) {
        var dto = service.create(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    @Operation(summary = "Listar treinos", description = "Lista os treinos ativos do usuário autenticado. Treinos excluídos não aparecem.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de treinos (vazia se não houver nenhum)", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TreinoResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<TreinoResponseDTO>> findAll(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.findAll(usuario.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar treino por id", description = "Retorna um treino do usuário autenticado. Treino inexistente, excluído ou de outro usuário retorna 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Treino encontrado", content = @Content(schema = @Schema(implementation = TreinoResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<TreinoResponseDTO> findById(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuario.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Alterar treino", description = "Altera nome, tipo e, se informada, a visibilidade de um treino do usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Treino alterado", content = @Content(schema = @Schema(implementation = TreinoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<TreinoResponseDTO> update(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long id,
            @Valid @RequestBody TreinoRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir treino", description = "Arquiva o treino (exclusão lógica): ele deixa de aparecer nas listagens, mas o histórico é preservado.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Treino excluído"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Treino não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> delete(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador do treino", example = "12") @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
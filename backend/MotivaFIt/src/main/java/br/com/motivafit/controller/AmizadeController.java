package br.com.motivafit.controller;

import br.com.motivafit.dto.request.AmizadeRequestDTO;
import br.com.motivafit.dto.request.AmizadeUpdateRequestDTO;
import br.com.motivafit.dto.response.AmizadeResponseDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.AmizadeService;
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
@RequestMapping("/api/amizades")
@Tag(name = "Amizades", description = "Amizades: gerenciamento de solicitações e relações de amizade entre usuários")
@SecurityRequirement(name = "AccessToken")
public class AmizadeController {

    private final AmizadeService service;

    public AmizadeController(AmizadeService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar amizades", description = "Lista todas as amizades (pendentes e aceitas) do usuário autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Amizades do usuário", content = @Content(array = @ArraySchema(schema = @Schema(implementation = AmizadeResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<AmizadeResponseDTO>> findAll(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.findAll(usuario.getId()));
    }

    @PostMapping
    @Operation(summary = "Enviar solicitação de amizade", description = "Envia uma solicitação de amizade para outro usuário.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Solicitação enviada", content = @Content(schema = @Schema(implementation = AmizadeResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário destinatário não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "Solicitação já existe ou usuário enviou para si mesmo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<AmizadeResponseDTO> create(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody AmizadeRequestDTO request) {
        var dto = service.create(usuario.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Responder solicitação de amizade", description = "O destinatário aceita ou recusa uma solicitação de amizade pendente.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitação respondida", content = @Content(schema = @Schema(implementation = AmizadeResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Estado inválido ou solicitação já respondida", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não é o destinatário da solicitação", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Amizade não encontrada", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<AmizadeResponseDTO> update(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador da amizade", example = "5") @PathVariable Long id,
            @Valid @RequestBody AmizadeUpdateRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover amizade", description = "Remove uma amizade ou cancela uma solicitação pendente. O solicitante pode cancelar solicitações pendentes; qualquer participante pode remover amizades aceitas.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Amizade removida"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não tem permissão para remover", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Amizade não encontrada", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> delete(
            @Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
            @Parameter(description = "Identificador da amizade", example = "5") @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}

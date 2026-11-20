package br.com.motivafit.controller;

import br.com.motivafit.dto.request.*;
import br.com.motivafit.dto.response.*;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.GrupoService;
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
@RequestMapping("/api/grupos")
@Tag(name = "Grupos", description = "Gerenciamento de grupos, membros, convites e feed")
@SecurityRequirement(name = "AccessToken")
public class GrupoController {
    private final GrupoService service;

    public GrupoController(GrupoService service) { this.service = service; }

    @GetMapping
    @Operation(summary = "Listar grupos", description = "Lista os grupos dos quais o usuário autenticado participa.")
    @ApiResponse(responseCode = "200", description = "Grupos encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = GrupoResponseDTO.class))))
    public ResponseEntity<List<GrupoResponseDTO>> findAll(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.findAll(usuario.getId()));
    }

    @PostMapping
    @Operation(summary = "Criar grupo")
    @ApiResponses({@ApiResponse(responseCode = "201", description = "Grupo criado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))})
    public ResponseEntity<GrupoResponseDTO> create(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                   @Valid @RequestBody GrupoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(usuario.getId(), request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar grupo")
    public ResponseEntity<GrupoResponseDTO> findById(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                     @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuario.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar grupo")
    public ResponseEntity<GrupoResponseDTO> update(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                   @PathVariable Long id,
                                                   @Valid @RequestBody GrupoRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir grupo")
    public ResponseEntity<Void> delete(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                       @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/membros")
    @Operation(summary = "Listar membros do grupo")
    public ResponseEntity<List<GrupoMembroResponseDTO>> findMembros(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                                    @PathVariable Long id) {
        return ResponseEntity.ok(service.findMembros(usuario.getId(), id));
    }

    @DeleteMapping("/{id}/membros/{usuarioId}")
    @Operation(summary = "Remover membro do grupo")
    public ResponseEntity<Void> removerMembro(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                              @PathVariable Long id, @PathVariable Long usuarioId) {
        service.removerMembro(usuario.getId(), id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convites")
    @Operation(summary = "Convidar usuário para o grupo")
    public ResponseEntity<ConviteGrupoResponseDTO> convidar(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                            @PathVariable Long id,
                                                            @Valid @RequestBody ConviteGrupoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.convidar(usuario.getId(), id, request));
    }

    @PostMapping("/convites/aceite")
    @Operation(summary = "Aceitar convite de grupo")
    public ResponseEntity<Void> aceitarConvite(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                               @Valid @RequestBody AceitarConviteGrupoRequestDTO request) {
        service.aceitarConvite(usuario.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/feed")
    @Operation(summary = "Consultar feed do grupo")
    public ResponseEntity<List<GrupoFeedResponseDTO>> findFeed(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                               @PathVariable Long id) {
        return ResponseEntity.ok(service.findFeed(usuario.getId(), id));
    }
}

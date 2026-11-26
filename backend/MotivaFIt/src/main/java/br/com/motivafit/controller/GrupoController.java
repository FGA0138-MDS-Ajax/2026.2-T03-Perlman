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
    @Operation(summary = "Listar grupos", description = "Lista os grupos dos quais o usuário autenticado participa, com o papel dele em cada um.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupos encontrados", content = @Content(array = @ArraySchema(schema = @Schema(implementation = GrupoResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<GrupoResponseDTO>> findAll(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.findAll(usuario.getId()));
    }

    @PostMapping
    @Operation(summary = "Criar grupo", description = "Cria um grupo; o criador se torna administrador.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Grupo criado", content = @Content(schema = @Schema(implementation = GrupoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<GrupoResponseDTO> create(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                   @Valid @RequestBody GrupoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(usuario.getId(), request));
    }

    @GetMapping("/convites")
    @Operation(summary = "Listar convites recebidos", description = "Lista os convites pendentes e não expirados recebidos pelo usuário autenticado, com o token para aceitá-los.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Convites pendentes", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ConviteGrupoRecebidoDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<ConviteGrupoRecebidoDTO>> convitesRecebidos(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.convitesRecebidos(usuario.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar grupo", description = "Retorna um grupo do qual o usuário participa.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupo encontrado", content = @Content(schema = @Schema(implementation = GrupoResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não participa do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<GrupoResponseDTO> findById(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                     @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuario.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar grupo", description = "Altera nome e descrição. Restrito a administradores do grupo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Grupo atualizado", content = @Content(schema = @Schema(implementation = GrupoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não é administrador do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<GrupoResponseDTO> update(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                   @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id,
                                                   @Valid @RequestBody GrupoRequestDTO request) {
        return ResponseEntity.ok(service.update(usuario.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir grupo", description = "Exclui o grupo com membros, convites e feed. Restrito a administradores do grupo.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Grupo excluído"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não é administrador do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> delete(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                       @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id) {
        service.delete(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/membros")
    @Operation(summary = "Listar membros do grupo", description = "Lista os membros e seus papéis. Restrito a membros do grupo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Membros do grupo", content = @Content(array = @ArraySchema(schema = @Schema(implementation = GrupoMembroResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não participa do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<GrupoMembroResponseDTO>> findMembros(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                                    @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id) {
        return ResponseEntity.ok(service.findMembros(usuario.getId(), id));
    }

    @DeleteMapping("/{id}/membros/{usuarioId}")
    @Operation(summary = "Remover membro do grupo", description = "Administradores removem membros; qualquer membro pode remover a si mesmo (sair). O último administrador não pode ser removido.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Membro removido"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Sem permissão para remover este membro", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo ou membro não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "Não é possível remover o último administrador", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> removerMembro(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                              @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id,
                                              @Parameter(description = "Identificador do membro", example = "15") @PathVariable Long usuarioId) {
        service.removerMembro(usuario.getId(), id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/convites")
    @Operation(summary = "Convidar usuário para o grupo", description = "Gera um convite válido por sete dias. Restrito a administradores do grupo.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Convite criado", content = @Content(schema = @Schema(implementation = ConviteGrupoResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não é administrador do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo ou usuário convidado não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "O usuário já participa ou tem convite pendente", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<ConviteGrupoResponseDTO> convidar(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                            @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id,
                                                            @Valid @RequestBody ConviteGrupoRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.convidar(usuario.getId(), id, request));
    }

    @PostMapping("/convites/aceite")
    @Operation(summary = "Aceitar convite de grupo", description = "Aceita um convite pendente destinado ao usuário autenticado e o inclui como membro.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Convite aceito"),
            @ApiResponse(responseCode = "400", description = "Convite expirado ou não pendente", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O convite pertence a outro usuário", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Convite não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> aceitarConvite(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                               @Valid @RequestBody AceitarConviteGrupoRequestDTO request) {
        service.aceitarConvite(usuario.getId(), request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/feed")
    @Operation(summary = "Consultar feed do grupo", description = "Lista as publicações e eventos do grupo, do mais recente ao mais antigo. Restrito a membros.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Feed do grupo", content = @Content(array = @ArraySchema(schema = @Schema(implementation = GrupoFeedResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não participa do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<GrupoFeedResponseDTO>> findFeed(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                               @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id) {
        return ResponseEntity.ok(service.findFeed(usuario.getId(), id));
    }

    @PostMapping("/{id}/feed")
    @Operation(summary = "Publicar no feed do grupo", description = "Publica um texto no feed (tipo PUBLICACAO). Restrito a membros.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Publicação criada", content = @Content(schema = @Schema(implementation = GrupoFeedResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Conteúdo vazio ou longo demais", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "O usuário não participa do grupo", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grupo não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<GrupoFeedResponseDTO> publicar(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                         @Parameter(description = "Identificador do grupo", example = "5") @PathVariable Long id,
                                                         @Valid @RequestBody GrupoFeedPostRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.publicar(usuario.getId(), id, request));
    }
}

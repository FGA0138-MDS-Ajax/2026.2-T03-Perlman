package br.com.motivafit.controller;

import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.CatalogoExercicioAdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/catalogo-exercicios")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERUSUARIO')")
@Tag(name = "Catálogo de exercícios (administração)", description = "Manutenção do catálogo. Restrito aos perfis ADMINISTRADOR e SUPERUSUARIO.")
@SecurityRequirement(name = "AccessToken")
public class CatalogoExercicioAdminController {

    private final CatalogoExercicioAdminService service;

    public CatalogoExercicioAdminController(CatalogoExercicioAdminService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Cadastrar exercício no catálogo", description = "Cria um novo exercício ativo. O nome deve ser único, sem diferenciar maiúsculas de minúsculas.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Exercício criado", content = @Content(schema = @Schema(implementation = CatalogoExercicioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Perfil sem permissão", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "Já existe um exercício com esse nome", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<CatalogoExercicioResponseDTO> create(
            @Valid @RequestBody CatalogoExercicioRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Alterar exercício do catálogo", description = "Altera nome, modalidade e grupo muscular. Também funciona para exercícios desativados.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exercício alterado", content = @Content(schema = @Schema(implementation = CatalogoExercicioResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Perfil sem permissão", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Exercício não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "Já existe outro exercício com esse nome", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<CatalogoExercicioResponseDTO> update(
            @Parameter(description = "Identificador do exercício", example = "1") @PathVariable Long id,
            @Valid @RequestBody CatalogoExercicioRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar exercício do catálogo", description = "Desativa o exercício (não apaga): ele deixa de aparecer no catálogo, mas treinos e registros que o usam são preservados.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Exercício desativado"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Perfil sem permissão", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Exercício não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<Void> deactivate(
            @Parameter(description = "Identificador do exercício", example = "1") @PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
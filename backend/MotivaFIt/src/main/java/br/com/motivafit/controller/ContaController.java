package br.com.motivafit.controller;

import br.com.motivafit.dto.response.UsuarioResponseDTO;
import br.com.motivafit.service.UsuarioService;
import br.com.motivafit.exception.ApiErroResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/conta")
@Tag(name = "Conta", description = "Consulta e exclusão de contas de usuários")
public class ContaController {
    private final UsuarioService service;

    public ContaController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERUSUARIO') or #id == authentication.principal.id")
    @Operation(
            summary = "Consultar conta por ID",
            description = "Retorna os dados da conta identificada. O usuário autenticado só pode consultar a própria conta."
    )
    @SecurityRequirement(name = "AccessToken")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conta encontrada", content = @Content(schema = @Schema(implementation = UsuarioResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Usuário sem permissão para consultar esta conta", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<UsuarioResponseDTO> findById(@Parameter(description = "Identificador da conta", example = "42") @PathVariable Long id){
        UsuarioResponseDTO response = service.findById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERUSUARIO') or #id == authentication.principal.id")
    @Operation(
            summary = "Excluir conta",
            description = "Exclui a conta identificada. A operação exige autenticação."
    )
    @SecurityRequirement(name = "AccessToken")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Conta excluída"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Conta não encontrada", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<?> delete(@Parameter(description = "Identificador da conta", example = "42") @PathVariable Long id){
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package br.com.motivafit.controller;

import br.com.motivafit.dto.request.PreferenciasRequestDTO;
import br.com.motivafit.dto.response.PreferenciasResponseDTO;
import br.com.motivafit.dto.response.UsuarioResumoDTO;
import br.com.motivafit.entity.Usuario;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuários", description = "Preferências da conta autenticada e localização de outras contas")
@SecurityRequirement(name = "AccessToken")
public class UsuarioController {
    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/me/preferencias")
    @Operation(summary = "Consultar preferências", description = "Retorna as preferências de interface da conta autenticada. O tema padrão é system.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferências da conta"),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<PreferenciasResponseDTO> buscarPreferencias(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(service.buscarPreferencias(usuario.getId()));
    }

    @PutMapping("/me/preferencias")
    @Operation(summary = "Salvar preferências", description = "Grava o tema da interface (light, dark ou system) na conta autenticada.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferências salvas"),
            @ApiResponse(responseCode = "400", description = "Tema inválido", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<PreferenciasResponseDTO> salvarPreferencias(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                                     @Valid @RequestBody PreferenciasRequestDTO request) {
        return ResponseEntity.ok(service.salvarPreferencias(usuario.getId(), request));
    }

    @GetMapping("/busca")
    @Operation(summary = "Localizar conta por e-mail",
            description = "Localiza outra conta ativa pelo e-mail exato, sem diferenciar maiúsculas. Não há busca parcial, para não expor a lista de e-mails. A própria conta não é retornada.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conta encontrada"),
            @ApiResponse(responseCode = "400", description = "E-mail não informado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Nenhuma outra conta ativa com este e-mail", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<UsuarioResumoDTO> buscarPorEmail(@Parameter(hidden = true) @AuthenticationPrincipal Usuario usuario,
                                                           @Parameter(description = "E-mail exato da conta", example = "amigo@motivafit.com") @RequestParam String email) {
        return ResponseEntity.ok(service.buscarPorEmail(usuario.getId(), email));
    }
}

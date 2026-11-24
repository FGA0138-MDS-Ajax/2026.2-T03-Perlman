package br.com.motivafit.controller;

import br.com.motivafit.dto.response.AdminTreinoDTO;
import br.com.motivafit.dto.response.PaginaDTO;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.AdminTreinoService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/treinos")
@Tag(name = "Administração: treinos", description = "Consulta dos treinos de todas as contas. Restrito aos perfis ADMINISTRADOR e SUPERUSUARIO.")
@SecurityRequirement(name = "AccessToken")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','SUPERUSUARIO')")
public class AdminTreinoController {
    private final AdminTreinoService service;

    public AdminTreinoController(AdminTreinoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar treinos da plataforma", description = "Lista os treinos não excluídos de todas as contas, com o e-mail do dono, do mais recente ao mais antigo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de treinos"),
            @ApiResponse(responseCode = "400", description = "Parâmetros de página inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Acesso restrito a administradores", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<PaginaDTO<AdminTreinoDTO>> listar(
            @Parameter(description = "Número da página, começando em 0", example = "0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Itens por página (1 a 100)", example = "50") @RequestParam(defaultValue = "50") int tamanho) {
        return ResponseEntity.ok(service.listar(pagina, tamanho));
    }
}

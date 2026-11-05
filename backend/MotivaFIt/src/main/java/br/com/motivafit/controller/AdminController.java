package br.com.motivafit.controller;

import br.com.motivafit.dto.request.AceitarConviteRequestDTO;
import br.com.motivafit.dto.request.ConviteAdminRequestDTO;
import br.com.motivafit.dto.response.ConviteCriado;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableMethodSecurity
@RequestMapping("/api/admin")
@Tag(name = "Administração", description = "Gerenciamento de convites para administradores")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/convites")
    @PreAuthorize("hasRole('SUPERUSUARIO')")
    @Operation(
            summary = "Criar convite de administrador",
            description = "Cria um convite válido por sete dias. Restrito ao perfil SUPERUSUARIO."
    )
    @SecurityRequirement(name = "AccessToken")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Convite criado", content = @Content(schema = @Schema(implementation = ConviteCriado.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "403", description = "Apenas SUPERUSUARIO pode criar convites", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário convidador não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "409", description = "Já existe convite pendente para o e-mail", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<ConviteCriado> criarConvite(@RequestBody @Valid ConviteAdminRequestDTO body){
        var response = adminService.criarConvite(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(201)).body(response);
    }

    @PostMapping("/convites/aceite")
    @Operation(
            summary = "Aceitar convite de administrador",
            description = "Aceita o convite associado ao token e promove o usuário informado. Requer autenticação."
    )
    @SecurityRequirement(name = "AccessToken")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Convite aceito e usuário promovido"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou convite inválido/expirado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<?> aceitarConvite(@RequestBody @Valid AceitarConviteRequestDTO body){
        adminService.aceitarConvite(body);
        return ResponseEntity.status(HttpStatusCode.valueOf(204)).build();
    }
}

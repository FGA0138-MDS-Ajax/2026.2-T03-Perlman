package br.com.motivafit.controller;

import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.exception.ApiErroResponse;
import br.com.motivafit.service.CatalogoExercicioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo-exercicios")
@Tag(name = "Catálogo de exercícios", description = "Consulta dos exercícios predefinidos que podem compor um treino. Somente exercícios ativos são exibidos.")
@SecurityRequirement(name = "AccessToken")
public class CatalogoExercicioController {

    private final CatalogoExercicioService service;

    public CatalogoExercicioController(CatalogoExercicioService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar exercícios", description = "Lista os exercícios ativos do catálogo, em ordem alfabética.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de exercícios", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CatalogoExercicioResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<List<CatalogoExercicioResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar exercício por id", description = "Retorna um exercício ativo do catálogo. Exercício inexistente ou desativado retorna 404.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Exercício encontrado", content = @Content(schema = @Schema(implementation = CatalogoExercicioResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Autenticação necessária", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "404", description = "Exercício não encontrado", content = @Content(schema = @Schema(implementation = ApiErroResponse.class))),
            @ApiResponse(responseCode = "500", description = "Erro interno", content = @Content(schema = @Schema(implementation = ApiErroResponse.class)))
    })
    public ResponseEntity<CatalogoExercicioResponseDTO> findById(
            @Parameter(description = "Identificador do exercício", example = "1") @PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
}
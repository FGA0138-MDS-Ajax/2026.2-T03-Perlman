package br.com.motivafit.controller;

import br.com.motivafit.dto.request.CatalogoExercicioRequestDTO;
import br.com.motivafit.dto.response.CatalogoExercicioResponseDTO;
import br.com.motivafit.service.CatalogoExercicioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/catalogo-exercicios")
@PreAuthorize("hasAnyRole('ADMINISTRADOR', 'SUPERUSUARIO')")
public class CatalogoExercicioController {

    private final CatalogoExercicioService service;

    public CatalogoExercicioController(CatalogoExercicioService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CatalogoExercicioResponseDTO> create(
            @Valid @RequestBody CatalogoExercicioRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogoExercicioResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoExercicioRequestDTO request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
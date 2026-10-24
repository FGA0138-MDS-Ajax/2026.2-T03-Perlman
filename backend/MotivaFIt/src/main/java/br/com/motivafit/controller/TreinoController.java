package br.com.motivafit.controller;

import br.com.motivafit.dto.request.TreinoRequestDTO;
import br.com.motivafit.dto.response.TreinoResponseDTO;
import br.com.motivafit.service.TreinoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treinos")
public class TreinoController {

    // PROVISÓRIO
    private static final Long USUARIO_PROVISORIO_ID = 1L;

    private final TreinoService service;

    public TreinoController(TreinoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<TreinoResponseDTO> create(
            @Valid @RequestBody TreinoRequestDTO request) {
        var dto = service.create(usuarioLogadoId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping
    public ResponseEntity<List<TreinoResponseDTO>> findAll() {
        return ResponseEntity.ok(service.findAll(usuarioLogadoId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TreinoResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(usuarioLogadoId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TreinoResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody TreinoRequestDTO request) {
        return ResponseEntity.ok(service.update(usuarioLogadoId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(usuarioLogadoId(), id);
        return ResponseEntity.noContent().build();
    }

    private Long usuarioLogadoId() {
        return USUARIO_PROVISORIO_ID;
    }
}
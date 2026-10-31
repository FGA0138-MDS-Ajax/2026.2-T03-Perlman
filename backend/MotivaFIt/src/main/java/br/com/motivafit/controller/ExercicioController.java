package br.com.motivafit.controller;

import br.com.motivafit.dto.request.ExercicioRequestDTO;
import br.com.motivafit.dto.response.ExercicioResponseDTO;
import br.com.motivafit.service.ExercicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/treinos/{treinoId}/exercicios")
@RequiredArgsConstructor
public class ExercicioController {

    private final ExercicioService exercicioService;

    @GetMapping
    public ResponseEntity<List<ExercicioResponseDTO>> listarExercicios(@PathVariable Long treinoId) {
        List<ExercicioResponseDTO> exercicios = exercicioService.listarPorTreinoId(treinoId);
        return ResponseEntity.ok(exercicios);
    }

    @PostMapping
    public ResponseEntity<ExercicioResponseDTO> adicionarExercicio(
            @PathVariable Long treinoId,
            @RequestBody ExercicioRequestDTO dto) {
        ExercicioResponseDTO novoExercicio = exercicioService.adicionarExercicio(treinoId, dto);
        return ResponseEntity.status(201).body(novoExercicio);
    }
}
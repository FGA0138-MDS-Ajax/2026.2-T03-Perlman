import type { ExercicioRequestDTO, ExercicioResponseDTO } from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";

function exercicioValido(item: unknown): item is ExercicioResponseDTO {
    if (typeof item !== "object" || item === null) return false;
    const exercicio = item as ExercicioResponseDTO;
    const recorde = exercicio.metaRecorde;
    return typeof exercicio.id === "number"
        && typeof exercicio.meta === "string"
        && (recorde === null || typeof recorde === "string")
        && typeof exercicio.treinoId === "number"
        && typeof exercicio.catalogoExercicioId === "number";
}

export async function listarExerciciosDoTreino(treinoId: number, signal?: AbortSignal): Promise<ExercicioResponseDTO[]> {
    const dados = await apiRequest<unknown>(`/api/treinos/${treinoId}/exercicios`, { signal });
    return exigirLista(dados, exercicioValido);
}

export async function adicionarExercicioAoTreino(treinoId: number, request: ExercicioRequestDTO): Promise<ExercicioResponseDTO> {
    const dados = await apiRequest<unknown>(`/api/treinos/${treinoId}/exercicios`, {
        method: "POST",
        body: request,
    });
    return exigirValor(dados, exercicioValido);
}

import type { TreinoRequestDTO, TreinoResponseDTO } from "@/lib/api/contracts";
import { apiRequest } from "@/lib/api/http-client";

export function listarTreinos(): Promise<TreinoResponseDTO[]> {
    return apiRequest<TreinoResponseDTO[]>("/api/treinos");
}

export function buscarTreino(id: number): Promise<TreinoResponseDTO> {
    return apiRequest<TreinoResponseDTO>(`/api/treinos/${id}`);
}

export function criarTreino(request: TreinoRequestDTO): Promise<TreinoResponseDTO> {
    return apiRequest<TreinoResponseDTO>("/api/treinos", {
        method: "POST",
        body: request,
    });
}

export function atualizarTreino(
    id: number,
    request: TreinoRequestDTO
): Promise<TreinoResponseDTO> {
    return apiRequest<TreinoResponseDTO>(`/api/treinos/${id}`, {
        method: "PUT",
        body: request,
    });
}

export function excluirTreino(id: number): Promise<void> {
    return apiRequest<void>(`/api/treinos/${id}`, { method: "DELETE" });
}

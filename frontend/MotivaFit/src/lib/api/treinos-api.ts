import type { TipoTreinoBackend, TreinoRequestDTO, TreinoResponseDTO, VisibilidadeBackend } from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";

const TIPOS: readonly TipoTreinoBackend[] = ["MUSCULACAO", "AEROBICO"];
const VISIBILIDADES: readonly VisibilidadeBackend[] = ["PRIVADO", "PUBLICO"];

function treinoValido(item: unknown): item is TreinoResponseDTO {
    if (typeof item !== "object" || item === null) return false;
    const treino = item as TreinoResponseDTO;
    return typeof treino.id === "number"
        && typeof treino.nome === "string"
        && TIPOS.includes(treino.tipo)
        && VISIBILIDADES.includes(treino.visibilidade)
        && typeof treino.createdAt === "string"
        && typeof treino.updatedAt === "string"
        && typeof treino.meuTreino === "boolean"
        && typeof treino.podeEditar === "boolean";
}

export async function listarTreinos(signal?: AbortSignal): Promise<TreinoResponseDTO[]> {
    const dados = await apiRequest<unknown>("/api/treinos", { signal });
    return exigirLista(dados, treinoValido);
}

export async function buscarTreino(id: number, signal?: AbortSignal): Promise<TreinoResponseDTO> {
    const dados = await apiRequest<unknown>(`/api/treinos/${id}`, { signal });
    return exigirValor(dados, treinoValido);
}

export async function criarTreino(request: TreinoRequestDTO): Promise<TreinoResponseDTO> {
    const dados = await apiRequest<unknown>("/api/treinos", {
        method: "POST",
        body: request,
    });
    return exigirValor(dados, treinoValido);
}

export async function atualizarTreino(
    id: number,
    request: TreinoRequestDTO
): Promise<TreinoResponseDTO> {
    const dados = await apiRequest<unknown>(`/api/treinos/${id}`, {
        method: "PUT",
        body: request,
    });
    return exigirValor(dados, treinoValido);
}

export function excluirTreino(id: number): Promise<void> {
    return apiRequest<void>(`/api/treinos/${id}`, { method: "DELETE" });
}

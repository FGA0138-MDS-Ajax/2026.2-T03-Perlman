import type {
    CatalogoExercicioRequestDTO,
    CatalogoExercicioResponseDTO,
    ModalidadeBackend,
} from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";

const MODALIDADES: readonly ModalidadeBackend[] = ["MUSCULACAO", "AEROBICO"];

function exercicioValido(item: unknown): item is CatalogoExercicioResponseDTO {
    if (typeof item !== "object" || item === null) return false;
    const exercicio = item as CatalogoExercicioResponseDTO;
    return typeof exercicio.id === "number"
        && typeof exercicio.nome === "string"
        && MODALIDADES.includes(exercicio.modalidade)
        && typeof exercicio.grupoMuscular === "string";
}

export async function listarCatalogoExercicios(signal?: AbortSignal): Promise<CatalogoExercicioResponseDTO[]> {
    const dados = await apiRequest<unknown>("/api/catalogo-exercicios", { signal });
    return exigirLista(dados, exercicioValido);
}

export async function buscarExercicioCatalogo(id: number, signal?: AbortSignal): Promise<CatalogoExercicioResponseDTO> {
    const dados = await apiRequest<unknown>(`/api/catalogo-exercicios/${id}`, { signal });
    return exigirValor(dados, exercicioValido);
}

export function criarExercicioCatalogo(
    request: CatalogoExercicioRequestDTO
): Promise<CatalogoExercicioResponseDTO> {
    return apiRequest<CatalogoExercicioResponseDTO>("/api/admin/catalogo-exercicios", {
        method: "POST",
        body: request,
    });
}

export function atualizarExercicioCatalogo(
    id: number,
    request: CatalogoExercicioRequestDTO
): Promise<CatalogoExercicioResponseDTO> {
    return apiRequest<CatalogoExercicioResponseDTO>(`/api/admin/catalogo-exercicios/${id}`, {
        method: "PUT",
        body: request,
    });
}

export function desativarExercicioCatalogo(id: number): Promise<void> {
    return apiRequest<void>(`/api/admin/catalogo-exercicios/${id}`, {
        method: "DELETE",
    });
}

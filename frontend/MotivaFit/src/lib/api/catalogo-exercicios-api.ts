import type {
    CatalogoExercicioRequestDTO,
    CatalogoExercicioResponseDTO,
} from "@/lib/api/contracts";
import { apiRequest } from "@/lib/api/http-client";

export function listarCatalogoExercicios(): Promise<CatalogoExercicioResponseDTO[]> {
    return apiRequest<CatalogoExercicioResponseDTO[]>("/api/catalogo-exercicios");
}

export function buscarExercicioCatalogo(id: number): Promise<CatalogoExercicioResponseDTO> {
    return apiRequest<CatalogoExercicioResponseDTO>(`/api/catalogo-exercicios/${id}`);
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

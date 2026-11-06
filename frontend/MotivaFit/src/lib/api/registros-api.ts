import type { RegistroDiarioRequestDTO, RegistroDiarioResponseDTO } from "@/lib/api/contracts";
import { apiRequest, exigirValor } from "@/lib/api/http-client";

function registroValido(item: unknown): item is RegistroDiarioResponseDTO {
    if (typeof item !== "object" || item === null) return false;
    const registro = item as RegistroDiarioResponseDTO;
    return typeof registro.id === "number"
        && typeof registro.catalogoId === "number"
        && typeof registro.exercicioNome === "string"
        && typeof registro.tempoS === "number";
}

export async function registrarExecucao(request: RegistroDiarioRequestDTO): Promise<RegistroDiarioResponseDTO> {
    const dados = await apiRequest<unknown>("/api/registros", {
        method: "POST",
        body: request,
    });
    return exigirValor(dados, registroValido);
}

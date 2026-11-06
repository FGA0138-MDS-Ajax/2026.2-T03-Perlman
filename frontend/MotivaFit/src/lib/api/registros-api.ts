import type { RegistroDiarioRequestDTO, RegistroDiarioResponseDTO } from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";

export const TAMANHO_PAGINA_HISTORICO = 50;
const TAMANHO_PAGINA_COMPLETA = 100;

function numeroOuNulo(valor: unknown): boolean {
    return valor === null || typeof valor === "number";
}

function textoOuNulo(valor: unknown): boolean {
    return valor === null || typeof valor === "string";
}

function registroValido(item: unknown): item is RegistroDiarioResponseDTO {
    if (typeof item !== "object" || item === null) return false;
    const registro = item as RegistroDiarioResponseDTO;
    return typeof registro.id === "number"
        && typeof registro.catalogoId === "number"
        && numeroOuNulo(registro.treinoId)
        && numeroOuNulo(registro.exercicioId)
        && textoOuNulo(registro.treinoNome)
        && typeof registro.exercicioNome === "string"
        && numeroOuNulo(registro.cargaKg)
        && numeroOuNulo(registro.repeticoes)
        && numeroOuNulo(registro.series)
        && typeof registro.tempoS === "number"
        && numeroOuNulo(registro.distanciaM)
        && typeof registro.executadoEm === "string";
}

export async function registrarExecucao(request: RegistroDiarioRequestDTO): Promise<RegistroDiarioResponseDTO> {
    const dados = await apiRequest<unknown>("/api/registros", {
        method: "POST",
        body: request,
    });
    return exigirValor(dados, registroValido);
}

export async function listarRegistros(
    pagina = 0,
    tamanho = TAMANHO_PAGINA_HISTORICO,
    signal?: AbortSignal,
): Promise<RegistroDiarioResponseDTO[]> {
    const dados = await apiRequest<unknown>(`/api/registros?pagina=${pagina}&tamanho=${tamanho}`, { signal });
    return exigirLista(dados, registroValido);
}

export async function listarTodasAsExecucoes(signal?: AbortSignal): Promise<RegistroDiarioResponseDTO[]> {
    const todas: RegistroDiarioResponseDTO[] = [];
    let pagina = 0;
    for (;;) {
        const lote = await listarRegistros(pagina, TAMANHO_PAGINA_COMPLETA, signal);
        todas.push(...lote);
        if (lote.length < TAMANHO_PAGINA_COMPLETA) return todas;
        pagina += 1;
    }
}

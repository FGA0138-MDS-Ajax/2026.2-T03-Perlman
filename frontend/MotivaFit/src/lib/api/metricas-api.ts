import { apiRequest, exigirLista } from "@/lib/api/http-client";

export interface EvolucaoPonto {
    periodo: string;
    catalogoId: number | null;
    exercicioNome: string | null;
    modalidade: string;
    execucoes: number;
    cargaMaxKg: number | null;
    repeticoesMax: number | null;
    seriesTotal: number;
    volumeKg: number | null;
    tempoTotalS: number;
    distanciaTotalM: number | null;
    paceSegPorKm: number | null;
}

function evolucaoValida(valor: unknown): valor is EvolucaoPonto {
    if (typeof valor !== "object" || valor === null) return false;
    const ponto = valor as EvolucaoPonto;
    return typeof ponto.periodo === "string"
        && typeof ponto.modalidade === "string"
        && typeof ponto.execucoes === "number";
}

export async function buscarEvolucao(params: {
    catalogoId?: number;
    de?: string;
    ate?: string;
    agrupamento?: "DIA" | "SEMANA" | "MES";
} = {}, signal?: AbortSignal): Promise<EvolucaoPonto[]> {
    const query = new URLSearchParams();
    if (params.catalogoId != null) query.set("catalogoId", String(params.catalogoId));
    if (params.de) query.set("de", params.de);
    if (params.ate) query.set("ate", params.ate);
    if (params.agrupamento) query.set("agrupamento", params.agrupamento);
    const sufixo = query.size > 0 ? `?${query.toString()}` : "";
    const dados = await apiRequest<unknown>(`/api/metricas/evolucao${sufixo}`, { signal });
    return exigirLista(dados, evolucaoValida);
}

async function buscarMetricaAdmin<T>(caminho: string, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<T> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([chave, valor]) => {
        if (valor !== undefined) query.set(chave, String(valor));
    });
    const sufixo = query.size > 0 ? `?${query.toString()}` : "";
    return apiRequest<T>(`/api/admin/metricas/${caminho}${sufixo}`, { signal });
}

export function buscarUsuariosAtivos(params: { de?: string; ate?: string; agrupamento?: "DIA" | "SEMANA" | "MES" } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("usuarios-ativos", params, signal);
}

export function buscarFrequenciaMedia(params: { de?: string; ate?: string } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("frequencia-media", params, signal);
}

export function buscarRankingTempo(params: { de?: string; ate?: string; limite?: number } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("ranking-tempo-treino", params, signal);
}

export function buscarExerciciosMaisRealizados(params: { de?: string; ate?: string; limite?: number } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("exercicios-mais-realizados", params, signal);
}

export function buscarMetricasRotinas(params: { de?: string; ate?: string; limite?: number } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("rotinas", params, signal);
}

export function buscarRetencao(params: { ate?: string; coortes?: number } = {}, signal?: AbortSignal) {
    return buscarMetricaAdmin<unknown>("retencao", params, signal);
}

import { ApiError, apiRequest, exigirLista } from "@/lib/api/http-client";

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

export type Agrupamento = "DIA" | "SEMANA" | "MES";
export interface Periodo { de?: string; ate?: string }

export interface UsuariosAtivos { de: string; ate: string; totalContas: number; ativosNoPeriodo: number; percentualAtivos: number }
export interface FrequenciaMedia {
    de: string; ate: string;
    mediaDiasPorSemana: number | null; medianaDiasPorSemana: number | null;
    distribuicao: { faixa: string; usuarios: number }[];
    serie: { semana: string; mediaDiasAtivos: number | null }[];
}
export interface RankingTempo {
    de: string; ate: string; tempoTotalS: number; mediaPorUsuarioAtivoS: number | null;
    medianaPorUsuarioAtivoS: number | null; ocultoPorPrivacidade: boolean;
    ranking: { posicao: number; tempoTotalS: number; diasAtivos: number; execucoes: number }[];
}
export interface ExerciciosMaisRealizados {
    de: string; ate: string; suprimidos: number;
    ranking: { posicao: number; catalogoId: number; nome: string; modalidade: string; grupoMuscular: string | null; execucoes: number; usuariosDistintos: number }[];
}
export interface MetricasRotinas {
    de: string; ate: string; treinosAtivos: number;
    porTipo: { tipo: string; treinos: number }[];
    percentualTreinosPublicos: number | null; percentualRegistrosComTreino: number | null;
    treinosPublicosMaisAdicionados: { posicao: number; treinoId: number; nome: string; adicoes: number; usuariosDistintos: number }[];
}
export interface Retencao {
    ate: string; taxaAtivacao7Dias: number | null; medianaDiasAtePrimeiroRegistro: number | null;
    coortes: Record<string, unknown>[];
}

const obj = (valor: unknown): valor is Record<string, unknown> => typeof valor === "object" && valor !== null;
const num = (valor: unknown): valor is number => typeof valor === "number" && Number.isFinite(valor);
const numOuNulo = (valor: unknown) => valor === null || valor === undefined || num(valor);
const lista = (valor: unknown, item: (v: unknown) => boolean) => Array.isArray(valor) && valor.every(item);

function exigir<T>(valor: unknown, valido: (v: Record<string, unknown>) => boolean): T {
    if (!obj(valor) || !valido(valor)) throw new ApiError(0, {
        codigo: "RESPOSTA_API_INVALIDA", mensagem: "O servidor retornou uma resposta inválida.", dataHora: new Date().toISOString(),
    });
    return valor as T;
}

async function buscarMetricaAdmin(caminho: string, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<unknown> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== "") query.set(chave, String(valor));
    });
    const sufixo = query.size > 0 ? `?${query.toString()}` : "";
    return apiRequest<unknown>(`/api/admin/metricas/${caminho}${sufixo}`, { signal });
}

export async function buscarUsuariosAtivos(params: Periodo & { agrupamento?: Agrupamento } = {}, signal?: AbortSignal): Promise<UsuariosAtivos> {
    return exigir(await buscarMetricaAdmin("usuarios-ativos", { ...params }, signal),
        (v) => num(v.totalContas) && num(v.ativosNoPeriodo) && num(v.percentualAtivos));
}

export async function buscarFrequenciaMedia(params: Periodo = {}, signal?: AbortSignal): Promise<FrequenciaMedia> {
    return exigir(await buscarMetricaAdmin("frequencia-media", { ...params }, signal),
        (v) => numOuNulo(v.mediaDiasPorSemana) && numOuNulo(v.medianaDiasPorSemana)
            && lista(v.distribuicao, (i) => obj(i) && typeof i.faixa === "string" && num(i.usuarios))
            && lista(v.serie, (i) => obj(i) && typeof i.semana === "string"));
}

export async function buscarRankingTempo(params: Periodo & { limite?: number } = {}, signal?: AbortSignal): Promise<RankingTempo> {
    return exigir(await buscarMetricaAdmin("ranking-tempo-treino", { ...params }, signal),
        (v) => num(v.tempoTotalS) && typeof v.ocultoPorPrivacidade === "boolean"
            && lista(v.ranking, (i) => obj(i) && num(i.posicao) && num(i.tempoTotalS)));
}

export async function buscarExerciciosMaisRealizados(params: Periodo & { limite?: number } = {}, signal?: AbortSignal): Promise<ExerciciosMaisRealizados> {
    return exigir(await buscarMetricaAdmin("exercicios-mais-realizados", { ...params }, signal),
        (v) => num(v.suprimidos) && lista(v.ranking, (i) => obj(i) && num(i.posicao) && typeof i.nome === "string" && num(i.execucoes)));
}

export async function buscarMetricasRotinas(params: Periodo & { limite?: number } = {}, signal?: AbortSignal): Promise<MetricasRotinas> {
    return exigir(await buscarMetricaAdmin("rotinas", { ...params }, signal),
        (v) => num(v.treinosAtivos) && lista(v.porTipo, (i) => obj(i) && typeof i.tipo === "string" && num(i.treinos))
            && lista(v.treinosPublicosMaisAdicionados, (i) => obj(i) && typeof i.nome === "string" && num(i.adicoes)));
}

export async function buscarRetencao(params: { ate?: string; coortes?: number } = {}, signal?: AbortSignal): Promise<Retencao> {
    return exigir(await buscarMetricaAdmin("retencao", { ...params }, signal),
        (v) => numOuNulo(v.taxaAtivacao7Dias) && numOuNulo(v.medianaDiasAtePrimeiroRegistro) && lista(v.coortes, obj));
}

import { apiRequest, exigirValor } from "@/lib/api/http-client";
import {
    buscarExerciciosMaisRealizados,
    buscarMetricasRotinas,
    buscarUsuariosAtivos,
    type ExerciciosMaisRealizados,
    type MetricasRotinas,
} from "@/lib/api/metricas-api";

/**
 * Visão geral da plataforma para o painel administrativo. Usa somente as métricas agregadas:
 * nenhuma conta, e-mail ou treino individual é consultado.
 */
export interface ResumoAdmin {
    totalUsuarios: number;
    usuariosAtivos: number;
    percentualAtivos: number | null;
    treinosAtivos: number;
    execucoesTopExercicios: number;
}
export interface RelatorioAdmin {
    resumo: ResumoAdmin;
    exercicios: ExerciciosMaisRealizados;
    rotinas: MetricasRotinas;
}
export const LIMITE_RANKING_ADMIN = 10;

function objeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null;
}
function contagem(valor: unknown): valor is number {
    return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0;
}

export async function buscarRelatorioAdmin(_pagina: number, signal?: AbortSignal): Promise<RelatorioAdmin> {
    const [ativos, rotinas, exercicios] = await Promise.all([
        buscarUsuariosAtivos({}, signal),
        buscarMetricasRotinas({ limite: LIMITE_RANKING_ADMIN }, signal),
        buscarExerciciosMaisRealizados({ limite: LIMITE_RANKING_ADMIN }, signal),
    ]);
    return {
        resumo: {
            totalUsuarios: ativos.totalContas,
            usuariosAtivos: ativos.ativosNoPeriodo,
            percentualAtivos: ativos.percentualAtivos,
            treinosAtivos: rotinas.treinosAtivos,
            // Soma apenas os exercícios do ranking: não há total global de execuções no contrato atual.
            execucoesTopExercicios: exercicios.ranking.reduce((total, item) => total + item.execucoes, 0),
        },
        exercicios,
        rotinas,
    };
}

export interface ConviteCriado {
    id: number;
    email: string;
    token: string;
    expiraEm: string;
}

export interface ConviteAdminRequestDTO {
    convidadorId: number;
    email: string;
}

export interface AceitarConviteRequestDTO {
    usuarioId: number;
    token: string;
}

export async function criarConvite(request: ConviteAdminRequestDTO): Promise<ConviteCriado> {
    return exigirValor(await apiRequest<unknown>("/api/admin/convites", {
        method: "POST",
        body: request,
    }), (valor): valor is ConviteCriado => {
        if (!objeto(valor)) return false;
        return contagem(valor.id) && typeof valor.email === "string"
            && typeof valor.token === "string" && typeof valor.expiraEm === "string";
    });
}

export async function aceitarConvite(request: AceitarConviteRequestDTO): Promise<void> {
    await apiRequest<void>("/api/admin/convites/aceite", {
        method: "POST",
        body: request,
    });
}

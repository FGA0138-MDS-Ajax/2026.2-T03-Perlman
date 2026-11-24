import { apiRequest, exigirValor } from "@/lib/api/http-client";

export interface ResumoAdmin {
    totalUsuarios: number;
    usuariosAtivos: number;
    percentualAtivos: number | null;
    treinosAtivos: number;
    execucoesTopExercicios: number;
}
export interface ContaAdmin {
    id: number;
    email: string;
    perfil: string;
    ativo: boolean;
}
export interface RelatorioAdmin {
    resumo: ResumoAdmin;
    usuarios: ContaAdmin[];
}
export interface TreinoAdmin {
    id: number;
    nome: string;
    usuarioEmail: string;
    tipo: "MUSCULACAO" | "AEROBICO";
    visibilidade: "PRIVADO" | "PUBLICO";
    copiaDePublico: boolean;
}
export interface PaginaTreinosAdmin { itens: TreinoAdmin[]; total: number }
export const TAMANHO_PAGINA_ADMIN = 50;

function objeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null;
}
function contagem(valor: unknown): valor is number {
    return typeof valor === "number" && Number.isSafeInteger(valor) && valor >= 0;
}
export async function buscarRelatorioAdmin(pagina: number, signal?: AbortSignal): Promise<RelatorioAdmin> {
    const [contas, ativos, rotinas, exercicios] = await Promise.all([
        apiRequest<unknown>("/api/conta/exportacao", { signal }),
        apiRequest<unknown>("/api/admin/metricas/usuarios-ativos", { signal }),
        apiRequest<unknown>("/api/admin/metricas/rotinas", { signal }),
        apiRequest<unknown>(`/api/admin/metricas/exercicios-mais-realizados?limite=${TAMANHO_PAGINA_ADMIN}`, { signal }),
    ]);
    if (!Array.isArray(contas)) throw new Error("O servidor retornou contas inválidas.");
    const contasValidas = contas.filter((item): item is ContaAdmin =>
        objeto(item) && contagem(item.id) && typeof item.email === "string" && typeof item.ativo === "boolean")
        .map((item) => ({ id: item.id, email: item.email, perfil: typeof item.perfil === "string" ? item.perfil : "", ativo: item.ativo }));
    const ativosObjeto = objeto(ativos) ? ativos : {};
    const rotinasObjeto = objeto(rotinas) ? rotinas : {};
    const exerciciosObjeto = objeto(exercicios) ? exercicios : {};
    const ranking = Array.isArray(exerciciosObjeto.ranking) ? exerciciosObjeto.ranking : [];
    return {
        resumo: {
            totalUsuarios: contasValidas.length,
            usuariosAtivos: typeof ativosObjeto.ativosNoPeriodo === "number" ? ativosObjeto.ativosNoPeriodo : 0,
            percentualAtivos: typeof ativosObjeto.percentualAtivos === "number" ? ativosObjeto.percentualAtivos : null,
            treinosAtivos: typeof rotinasObjeto.treinosAtivos === "number" ? rotinasObjeto.treinosAtivos : 0,
            // Soma apenas os exercícios do ranking: não há total global de execuções no contrato atual.
            execucoesTopExercicios: ranking.reduce((total: number, item: unknown) =>
                total + (objeto(item) && typeof item.execucoes === "number" ? item.execucoes : 0), 0),
        },
        usuarios: contasValidas.slice(pagina * TAMANHO_PAGINA_ADMIN, (pagina + 1) * TAMANHO_PAGINA_ADMIN),
    };
}
/** Treinos de todas as contas, paginados pelo servidor (GET /api/admin/treinos). */
export async function listarTreinosAdmin(pagina: number, signal?: AbortSignal): Promise<PaginaTreinosAdmin> {
    const dados = await apiRequest<unknown>(`/api/admin/treinos?pagina=${pagina}&tamanho=${TAMANHO_PAGINA_ADMIN}`, { signal });
    if (!objeto(dados) || !Array.isArray(dados.itens) || !contagem(dados.total)) {
        throw new Error("O servidor retornou uma lista de treinos inválida.");
    }
    const itens = dados.itens.filter((item): item is TreinoAdmin => objeto(item)
        && contagem(item.id) && typeof item.nome === "string"
        && (item.tipo === "MUSCULACAO" || item.tipo === "AEROBICO")
        && (item.visibilidade === "PRIVADO" || item.visibilidade === "PUBLICO")
    ).map((item) => ({
        id: item.id,
        nome: item.nome,
        usuarioEmail: typeof item.usuarioEmail === "string" ? item.usuarioEmail : "",
        tipo: item.tipo,
        visibilidade: item.visibilidade,
        copiaDePublico: contagem((item as unknown as Record<string, unknown>).treinoOrigemId),
    }));
    return { itens, total: dados.total };
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

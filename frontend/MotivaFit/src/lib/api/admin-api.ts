import { apiRequest, exigirValor } from "@/lib/api/http-client";

export interface ResumoAdmin {
    totalUsuarios: number;
    totalFichas: number;
    totalExecucoes: number;
    usuariosComFichas: number;
    usuariosAtivos30Dias: number;
}
export interface AtividadeUsuarioAdmin {
    id: number;
    email: string;
    ativo: boolean;
    fichas: number;
    execucoes: number;
    ultimaExecucao: string | null;
}
export interface RelatorioAdmin {
    resumo: ResumoAdmin;
    usuarios: AtividadeUsuarioAdmin[];
}
export interface TreinoAdmin {
    id: number;
    nome: string;
    usuarioEmail: string;
    tipo: "MUSCULACAO" | "AEROBICO";
    visibilidade: "PRIVADO" | "PUBLICO";
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
    const contasValidas = contas.filter((item): item is { id: number; email: string; ativo: boolean } =>
        objeto(item) && contagem(item.id) && typeof item.email === "string" && typeof item.ativo === "boolean");
    const ativosObjeto = objeto(ativos) ? ativos : {};
    const rotinasObjeto = objeto(rotinas) ? rotinas : {};
    const exerciciosObjeto = objeto(exercicios) ? exercicios : {};
    const totalUsuarios = contasValidas.length;
    const usuariosAtivos30Dias = typeof ativosObjeto.ativosNoPeriodo === "number" ? ativosObjeto.ativosNoPeriodo : 0;
    const totalFichas = typeof rotinasObjeto.treinosAtivos === "number" ? rotinasObjeto.treinosAtivos : 0;
    const ranking = Array.isArray(exerciciosObjeto.ranking) ? exerciciosObjeto.ranking : [];
    const totalExecucoes = ranking.reduce((total, item) =>
        total + (objeto(item) && typeof item.execucoes === "number" ? item.execucoes : 0), 0);
    return {
        resumo: {
            totalUsuarios,
            totalFichas,
            totalExecucoes,
            usuariosComFichas: 0,
            usuariosAtivos30Dias,
        },
        usuarios: contasValidas.slice(pagina * TAMANHO_PAGINA_ADMIN, (pagina + 1) * TAMANHO_PAGINA_ADMIN).map((conta) => ({
            id: conta.id,
            email: conta.email,
            ativo: conta.ativo,
            fichas: 0,
            execucoes: 0,
            ultimaExecucao: null,
        })),
    };
}
export async function listarTreinosAdmin(pagina: number, signal?: AbortSignal): Promise<PaginaTreinosAdmin> {
    const treinos = await apiRequest<unknown>("/api/treinos", { signal });
    if (!Array.isArray(treinos)) throw new Error("O servidor retornou uma lista de treinos inválida.");
    const itens = treinos.filter((item): item is TreinoAdmin => objeto(item)
        && contagem(item.id) && typeof item.nome === "string"
        && (item.tipo === "MUSCULACAO" || item.tipo === "AEROBICO")
        && (item.visibilidade === "PRIVADO" || item.visibilidade === "PUBLICO")
    ).map((item) => ({
        id: item.id,
        nome: item.nome,
        usuarioEmail: "",
        tipo: item.tipo,
        visibilidade: item.visibilidade,
    }));
    return { itens: itens.slice(pagina * TAMANHO_PAGINA_ADMIN, (pagina + 1) * TAMANHO_PAGINA_ADMIN), total: itens.length };
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

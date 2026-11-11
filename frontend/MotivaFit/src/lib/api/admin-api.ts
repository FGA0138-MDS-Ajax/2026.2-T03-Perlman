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
function relatorioValido(valor: unknown): valor is RelatorioAdmin {
    if (!objeto(valor) || !objeto(valor.resumo) || !Array.isArray(valor.usuarios)) return false;
    const resumo = valor.resumo;
    return ["totalUsuarios", "totalFichas", "totalExecucoes", "usuariosComFichas", "usuariosAtivos30Dias"].every((campo) => contagem(resumo[campo]))
        && valor.usuarios.every((item: unknown) => objeto(item) && contagem(item.id)
            && typeof item.email === "string" && typeof item.ativo === "boolean"
            && contagem(item.fichas) && contagem(item.execucoes)
            && (item.ultimaExecucao === null || typeof item.ultimaExecucao === "string" && Number.isFinite(Date.parse(item.ultimaExecucao))));
}
function treinosValidos(valor: unknown): valor is PaginaTreinosAdmin {
    return objeto(valor) && contagem(valor.total) && Array.isArray(valor.itens)
        && valor.itens.every((item: unknown) => objeto(item) && contagem(item.id)
            && typeof item.nome === "string" && typeof item.usuarioEmail === "string"
            && (item.tipo === "MUSCULACAO" || item.tipo === "AEROBICO")
            && (item.visibilidade === "PRIVADO" || item.visibilidade === "PUBLICO"));
}
export async function buscarRelatorioAdmin(pagina: number, signal?: AbortSignal): Promise<RelatorioAdmin> {
    return exigirValor(await apiRequest<unknown>(`/api/admin/relatorios?pagina=${pagina}&tamanho=${TAMANHO_PAGINA_ADMIN}`, { signal }), relatorioValido);
}
export async function listarTreinosAdmin(pagina: number, signal?: AbortSignal): Promise<PaginaTreinosAdmin> {
    return exigirValor(await apiRequest<unknown>(`/api/admin/treinos?pagina=${pagina}&tamanho=${TAMANHO_PAGINA_ADMIN}`, { signal }), treinosValidos);
}

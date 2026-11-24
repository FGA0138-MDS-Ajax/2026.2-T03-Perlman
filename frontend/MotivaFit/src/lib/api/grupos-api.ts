import type {
    ConviteGrupoResponseDTO,
    GrupoFeedResponseDTO,
    GrupoMembroResponseDTO,
    GrupoRequestDTO,
    GrupoResponseDTO,
} from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";
import { inteiro, objeto, texto, textoOuNulo } from "@/lib/api/validacao";

const papelValido = (valor: unknown) => valor === "ADMIN" || valor === "MEMBRO";

function grupoValido(valor: unknown): valor is GrupoResponseDTO {
    return objeto(valor) && inteiro(valor.id) && texto(valor.nome) && textoOuNulo(valor.descricao)
        && inteiro(valor.criadorId) && papelValido(valor.papel);
}

function membroValido(valor: unknown): valor is GrupoMembroResponseDTO {
    return objeto(valor) && inteiro(valor.usuarioId) && texto(valor.email) && papelValido(valor.papel);
}

function conviteValido(valor: unknown): valor is ConviteGrupoResponseDTO {
    return objeto(valor) && inteiro(valor.id) && inteiro(valor.grupoId) && inteiro(valor.convidadoId)
        && texto(valor.token) && texto(valor.expiraEm);
}

function postValido(valor: unknown): valor is GrupoFeedResponseDTO {
    return objeto(valor) && inteiro(valor.id) && inteiro(valor.usuarioId) && texto(valor.tipo)
        && texto(valor.conteudo) && texto(valor.criadoEm);
}

export async function listarGrupos(signal?: AbortSignal): Promise<GrupoResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>("/api/grupos", { signal }), grupoValido);
}

export async function buscarGrupo(id: number, signal?: AbortSignal): Promise<GrupoResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/grupos/${id}`, { signal }), grupoValido);
}

export async function criarGrupo(request: GrupoRequestDTO): Promise<GrupoResponseDTO> {
    return exigirValor(await apiRequest<unknown>("/api/grupos", { method: "POST", body: request }), grupoValido);
}

export async function atualizarGrupo(id: number, request: GrupoRequestDTO): Promise<GrupoResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/grupos/${id}`, { method: "PUT", body: request }), grupoValido);
}

export async function excluirGrupo(id: number): Promise<void> {
    await apiRequest<void>(`/api/grupos/${id}`, { method: "DELETE" });
}

export async function listarMembros(id: number, signal?: AbortSignal): Promise<GrupoMembroResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>(`/api/grupos/${id}/membros`, { signal }), membroValido);
}

export async function removerMembro(id: number, usuarioId: number): Promise<void> {
    await apiRequest<void>(`/api/grupos/${id}/membros/${usuarioId}`, { method: "DELETE" });
}

export async function convidarParaGrupo(id: number, usuarioId: number): Promise<ConviteGrupoResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/grupos/${id}/convites`, {
        method: "POST", body: { usuarioId },
    }), conviteValido);
}

export async function aceitarConviteGrupo(token: string): Promise<void> {
    await apiRequest<void>("/api/grupos/convites/aceite", { method: "POST", body: { token } });
}

export async function listarFeed(id: number, signal?: AbortSignal): Promise<GrupoFeedResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>(`/api/grupos/${id}/feed`, { signal }), postValido);
}

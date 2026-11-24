import type {
    DesafioItemResponseDTO,
    DesafioParticipanteResponseDTO,
    DesafioRequestDTO,
    DesafioResponseDTO,
    EstadoParticipante,
} from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";
import { inteiro, numeroOuNulo, objeto, texto, textoOuNulo } from "@/lib/api/validacao";

function itemValido(valor: unknown): valor is DesafioItemResponseDTO {
    return objeto(valor) && inteiro(valor.id) && inteiro(valor.catalogoId) && texto(valor.exercicioNome)
        && (valor.modalidade === "MUSCULACAO" || valor.modalidade === "AEROBICO")
        && numeroOuNulo(valor.metaCargaKg) && numeroOuNulo(valor.metaRepeticoes) && numeroOuNulo(valor.metaSeries)
        && numeroOuNulo(valor.metaTempoS) && numeroOuNulo(valor.metaDistanciaM);
}

function desafioValido(valor: unknown): valor is DesafioResponseDTO {
    return objeto(valor) && inteiro(valor.id) && texto(valor.titulo) && texto(valor.prazo)
        && textoOuNulo(valor.descricao)
        && (valor.visibilidade === "PRIVADO" || valor.visibilidade === "PUBLICO")
        && (valor.estado === "ATIVO" || valor.estado === "CANCELADO")
        && typeof valor.souCriador === "boolean"
        && Array.isArray(valor.itens) && valor.itens.every(itemValido);
}

function participanteValido(valor: unknown): valor is DesafioParticipanteResponseDTO {
    return objeto(valor) && inteiro(valor.usuarioId) && texto(valor.email)
        && (valor.estado === "CONVIDADO" || valor.estado === "ACEITO" || valor.estado === "RECUSADO")
        && textoOuNulo(valor.aceitoEm);
}

export async function listarDesafios(signal?: AbortSignal): Promise<DesafioResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>("/api/desafios", { signal }), desafioValido);
}

export async function buscarDesafio(id: number, signal?: AbortSignal): Promise<DesafioResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/desafios/${id}`, { signal }), desafioValido);
}

export async function criarDesafio(request: DesafioRequestDTO): Promise<DesafioResponseDTO> {
    return exigirValor(await apiRequest<unknown>("/api/desafios", { method: "POST", body: request }), desafioValido);
}

export async function atualizarDesafio(id: number, request: DesafioRequestDTO): Promise<DesafioResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/desafios/${id}`, { method: "PUT", body: request }), desafioValido);
}

export async function cancelarDesafio(id: number): Promise<void> {
    await apiRequest<void>(`/api/desafios/${id}`, { method: "DELETE" });
}

export async function listarParticipantes(id: number, signal?: AbortSignal): Promise<DesafioParticipanteResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>(`/api/desafios/${id}/participantes`, { signal }), participanteValido);
}

export async function convidarParticipante(id: number, usuarioId: number): Promise<DesafioParticipanteResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/desafios/${id}/participantes`, {
        method: "POST", body: { usuarioId },
    }), participanteValido);
}

export async function responderParticipacao(id: number, estado: Exclude<EstadoParticipante, "CONVIDADO">): Promise<DesafioParticipanteResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/desafios/${id}/participantes/me`, {
        method: "PATCH", body: { estado },
    }), participanteValido);
}

export async function sairDoDesafio(id: number): Promise<void> {
    await apiRequest<void>(`/api/desafios/${id}/participantes/me`, { method: "DELETE" });
}

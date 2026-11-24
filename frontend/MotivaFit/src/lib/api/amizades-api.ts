import type { AmizadeResponseDTO } from "@/lib/api/contracts";
import { apiRequest, exigirLista, exigirValor } from "@/lib/api/http-client";
import { inteiro, objeto, texto } from "@/lib/api/validacao";

function amizadeValida(valor: unknown): valor is AmizadeResponseDTO {
    return objeto(valor) && inteiro(valor.id)
        && inteiro(valor.solicitanteId) && texto(valor.solicitanteEmail)
        && inteiro(valor.destinatarioId) && texto(valor.destinatarioEmail)
        && (valor.estado === "PENDENTE" || valor.estado === "ACEITA" || valor.estado === "RECUSADA")
        && texto(valor.criadoEm) && texto(valor.atualizadoEm);
}

export async function listarAmizades(signal?: AbortSignal): Promise<AmizadeResponseDTO[]> {
    return exigirLista(await apiRequest<unknown>("/api/amizades", { signal }), amizadeValida);
}

export async function enviarSolicitacao(destinatarioId: number): Promise<AmizadeResponseDTO> {
    return exigirValor(await apiRequest<unknown>("/api/amizades", {
        method: "POST", body: { destinatarioId },
    }), amizadeValida);
}

export async function responderSolicitacao(id: number, estado: "ACEITA" | "RECUSADA"): Promise<AmizadeResponseDTO> {
    return exigirValor(await apiRequest<unknown>(`/api/amizades/${id}`, {
        method: "PATCH", body: { estado },
    }), amizadeValida);
}

export async function removerAmizade(id: number): Promise<void> {
    await apiRequest<void>(`/api/amizades/${id}`, { method: "DELETE" });
}

export interface Amigo {
    amizadeId: number;
    usuarioId: number;
    email: string;
}

/** Converte as amizades aceitas na lista de amigos do usuário informado. */
export function amigosDe(amizades: AmizadeResponseDTO[], usuarioId: number): Amigo[] {
    return amizades.filter((item) => item.estado === "ACEITA").map((item) => item.solicitanteId === usuarioId
        ? { amizadeId: item.id, usuarioId: item.destinatarioId, email: item.destinatarioEmail }
        : { amizadeId: item.id, usuarioId: item.solicitanteId, email: item.solicitanteEmail });
}

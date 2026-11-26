import { apiRequest, exigirValor } from "@/lib/api/http-client";

export type Tema = "dark" | "light" | "system";

export interface Preferencias {
    tema: Tema;
}

const CAMINHO = "/api/usuarios/me/preferencias";

function preferenciasValidas(valor: unknown): valor is Preferencias {
    if (typeof valor !== "object" || valor === null || !("tema" in valor)) return false;
    const tema = (valor as Record<string, unknown>).tema;
    return tema === "light" || tema === "dark" || tema === "system";
}

// A preferência pertence à conta: é lida e gravada somente pela API, sem armazenamento local.
export async function buscarPreferencias(signal?: AbortSignal): Promise<Preferencias> {
    return exigirValor(await apiRequest<unknown>(CAMINHO, { signal }), preferenciasValidas);
}

export async function salvarTema(tema: Tema, signal?: AbortSignal): Promise<Preferencias> {
    return exigirValor(await apiRequest<unknown>(CAMINHO, { method: "PUT", body: { tema }, signal }), preferenciasValidas);
}

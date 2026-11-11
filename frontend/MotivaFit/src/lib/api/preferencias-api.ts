import { apiRequest, exigirValor } from "@/lib/api/http-client";

export type Tema = "dark" | "light" | "system";
interface Preferencias { tema: Tema }
function preferenciasValidas(valor: unknown): valor is Preferencias {
    if (typeof valor !== "object" || valor === null || !("tema" in valor)) return false;
    return valor.tema === "light" || valor.tema === "dark" || valor.tema === "system";
}
export async function buscarPreferencias(signal?: AbortSignal): Promise<Preferencias> {
    return exigirValor(await apiRequest<unknown>("/api/usuarios/me/preferencias", { signal }), preferenciasValidas);
}
export async function salvarTema(tema: Tema, signal?: AbortSignal): Promise<Preferencias> {
    return exigirValor(await apiRequest<unknown>("/api/usuarios/me/preferencias", { method: "PUT", body: { tema }, signal }), preferenciasValidas);
}

import type { UsuarioResumoDTO } from "@/lib/api/contracts";
import { apiRequest, exigirValor } from "@/lib/api/http-client";
import { inteiro, objeto, texto } from "@/lib/api/validacao";

function resumoValido(valor: unknown): valor is UsuarioResumoDTO {
    return objeto(valor) && inteiro(valor.id) && texto(valor.email);
}

/** Localiza outra conta ativa pelo e-mail exato (404 quando não existe ou é a própria conta). */
export async function buscarUsuarioPorEmail(email: string, signal?: AbortSignal): Promise<UsuarioResumoDTO> {
    const query = new URLSearchParams({ email: email.trim() });
    return exigirValor(await apiRequest<unknown>(`/api/usuarios/busca?${query.toString()}`, { signal }), resumoValido);
}

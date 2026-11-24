import type { UsuarioResponseDTO } from "@/lib/api/contracts";
import { apiRequest, exigirValor } from "@/lib/api/http-client";

function usuarioValido(valor: unknown): valor is UsuarioResponseDTO {
    if (typeof valor !== "object" || valor === null) return false;
    const usuario = valor as UsuarioResponseDTO;
    return typeof usuario.id === "number"
        && typeof usuario.email === "string"
        && (usuario.perfil === "USUARIO" || usuario.perfil === "ADMINISTRADOR" || usuario.perfil === "SUPERUSUARIO")
        && typeof usuario.ativo === "boolean";
}

export async function buscarConta(id: number, signal?: AbortSignal): Promise<UsuarioResponseDTO> {
    const dados = await apiRequest<unknown>(`/api/conta/${id}`, { signal });
    return exigirValor(dados, usuarioValido);
}

export async function excluirConta(id: number): Promise<void> {
    await apiRequest<void>(`/api/conta/${id}`, { method: "DELETE" });
}

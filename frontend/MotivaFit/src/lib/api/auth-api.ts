import type {
    JwtUsuarioClaims,
    LoginRequestDTO,
    LoginResponseDTO,
    UsuarioRequestDTO,
    UsuarioResponseDTO,
} from "@/lib/api/contracts";
import { apiRequest, readCsrfCookie, setAccessToken } from "@/lib/api/http-client";

function decodeBase64Url(value: string): string {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

function isJwtUsuarioClaims(value: unknown): value is JwtUsuarioClaims {
    return (
        typeof value === "object" &&
        value !== null &&
        "sub" in value &&
        typeof value.sub === "string" &&
        "id" in value &&
        typeof value.id === "number" &&
        "ativo" in value &&
        typeof value.ativo === "boolean" &&
        "perfil" in value &&
        (value.perfil === "USUARIO" ||
            value.perfil === "ADMINISTRADOR" ||
            value.perfil === "SUPERUSUARIO") &&
        "iss" in value &&
        typeof value.iss === "string" &&
        "iat" in value &&
        typeof value.iat === "number" &&
        "exp" in value &&
        typeof value.exp === "number"
    );
}

export function readJwtUsuarioClaims(token: string): JwtUsuarioClaims {
    const [, encodedPayload] = token.split(".");
    if (!encodedPayload) {
        throw new Error("O token de acesso retornado pela API não possui um payload válido.");
    }

    const payload: unknown = JSON.parse(decodeBase64Url(encodedPayload));
    if (!isJwtUsuarioClaims(payload)) {
        throw new Error("O token de acesso não corresponde ao contrato de claims do backend.");
    }

    return payload;
}

export async function registerAccount(request: UsuarioRequestDTO): Promise<UsuarioResponseDTO> {
    return apiRequest<UsuarioResponseDTO>("/api/auth/cadastro", {
        method: "POST",
        authenticated: false,
        body: request,
    });
}

export async function login(request: LoginRequestDTO): Promise<LoginResponseDTO> {
    const response = await apiRequest<LoginResponseDTO>("/api/auth/login", {
        method: "POST",
        authenticated: false,
        body: request,
    });
    setAccessToken(response.token);
    return response;
}

export async function refreshSession(): Promise<LoginResponseDTO> {
    const response = await apiRequest<LoginResponseDTO>("/api/auth/refresh", {
        method: "POST",
        authenticated: false,
        headers: { "X-CSRF-TOKEN": readCsrfCookie() },
    });
    setAccessToken(response.token);
    return response;
}

export async function logout(): Promise<void> {
    try {
        await apiRequest<void>("/api/auth/logout", {
            method: "POST",
            authenticated: false,
            headers: { "X-CSRF-TOKEN": readCsrfCookie() },
        });
    } finally {
        setAccessToken(null);
    }
}

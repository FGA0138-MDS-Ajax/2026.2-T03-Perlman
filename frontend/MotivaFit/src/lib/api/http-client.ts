import type { ApiErroResponse } from "@/lib/api/contracts";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080")
    .replace(/\/+$/, "");

let accessToken: string | null = null;

function isApiErroResponse(value: unknown): value is ApiErroResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "codigo" in value &&
        typeof value.codigo === "string" &&
        "mensagem" in value &&
        typeof value.mensagem === "string" &&
        "dataHora" in value &&
        typeof value.dataHora === "string"
    );
}

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly occurredAt?: string;

    constructor(status: number, error: ApiErroResponse) {
        super(error.mensagem);
        this.name = "ApiError";
        this.status = status;
        this.code = error.codigo;
        this.occurredAt = error.dataHora;
    }
}

export function setAccessToken(token: string | null): void {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function readCsrfCookie(): string {
    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith("csrfToken="));

    if (!cookie) {
        throw new Error("Cookie CSRF ausente; não é possível renovar ou encerrar a sessão.");
    }

    return decodeURIComponent(cookie.slice("csrfToken=".length));
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: BodyInit | object | null;
    authenticated?: boolean;
}

export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const { authenticated = true, body, headers: requestHeaders, ...requestOptions } = options;
    const headers = new Headers(requestHeaders);

    if (body !== undefined && body !== null && !(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
    }
    if (authenticated && accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers,
        credentials: "include",
        body:
            body === undefined || body === null
                ? undefined
                : body instanceof FormData || typeof body === "string"
                  ? body
                  : JSON.stringify(body),
    });

    if (!response.ok) {
        let error: ApiErroResponse;
        try {
            const parsed: unknown = await response.json();
            if (!isApiErroResponse(parsed)) {
                throw new Error("Formato de erro da API inválido.");
            }
            error = parsed;
        } catch (cause) {
            throw new ApiError(response.status, {
                codigo: "RESPOSTA_API_INVALIDA",
                mensagem: cause instanceof Error
                    ? `A API retornou erro HTTP ${response.status} com corpo inválido: ${cause.message}`
                    : `A API retornou erro HTTP ${response.status} com corpo inválido.`,
                dataHora: new Date().toISOString(),
            });
        }
        throw new ApiError(response.status, error);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

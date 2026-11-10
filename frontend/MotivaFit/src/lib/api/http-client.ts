import type { ApiErroResponse, LoginResponseDTO } from "@/lib/api/contracts";

const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");
export const SESSION_CHANGED_EVENT = "motivafit:session-changed";
let accessToken: string | null = null;
let sessionVersion = 0;
let pendingRefresh: Promise<LoginResponseDTO> | null = null;

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly occurredAt: string;

    constructor(status: number, error: ApiErroResponse, cause?: unknown) {
        super(error.mensagem, { cause });
        this.name = "ApiError";
        this.status = status;
        this.code = error.codigo;
        this.occurredAt = error.dataHora;
    }
}

export function exigirValor<T>(valor: unknown, valido: (item: unknown) => item is T): T {
    if (!valido(valor)) {
        throw clientError("RESPOSTA_API_INVALIDA", "O servidor retornou uma resposta inválida.");
    }
    return valor;
}

export function exigirLista<T>(valor: unknown, itemValido: (item: unknown) => item is T): T[] {
    if (!Array.isArray(valor)) {
        throw clientError("RESPOSTA_API_INVALIDA", "O servidor retornou uma resposta inválida.");
    }
    return valor.map((item) => exigirValor(item, itemValido));
}

function clientError(code: string, message: string, status = 0, cause?: unknown): ApiError {
    return new ApiError(status, {
        codigo: code, mensagem: message, dataHora: new Date().toISOString(),
    }, cause);
}

function isApiErroResponse(value: unknown): value is ApiErroResponse {
    return typeof value === "object" && value !== null
        && "codigo" in value && typeof value.codigo === "string"
        && "mensagem" in value && typeof value.mensagem === "string"
        && "dataHora" in value && typeof value.dataHora === "string";
}

export function setAccessToken(token: string | null): void {
    accessToken = token;
    sessionVersion += 1;
    if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function getAccessToken(): string | null {
    return accessToken;
}

export function readCsrfCookie(): string {
    const cookie = document.cookie.split(";").map((item) => item.trim())
        .find((item) => item.startsWith("csrfToken="));
    if (!cookie) throw clientError("CSRF_AUSENTE", "Sessão indisponível. Entre novamente.");
    try {
        return decodeURIComponent(cookie.slice("csrfToken=".length));
    } catch (cause) {
        throw clientError("CSRF_INVALIDO", "Sessão inválida. Entre novamente.", 0, cause);
    }
}

async function parseResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) return undefined as T;
    let parsed: unknown;
    try {
        parsed = await response.json();
    } catch (cause) {
        throw clientError("RESPOSTA_API_INVALIDA", "O servidor retornou uma resposta inválida.", response.status, cause);
    }
    if (!response.ok) {
        if (isApiErroResponse(parsed)) throw new ApiError(response.status, parsed);
        throw clientError("RESPOSTA_API_INVALIDA", "O servidor retornou um erro inesperado.", response.status);
    }
    return parsed as T;
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
    body?: object | string | null;
    authenticated?: boolean;
}

async function sendRequest(path: string, options: ApiRequestOptions, token: string | null): Promise<Response> {
    const { body, headers: customHeaders, authenticated: _authenticated, ...init } = options;
    const headers = new Headers(customHeaders);
    const isForm = body instanceof FormData;
    if (body != null && !isForm) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);
    try {
        return await fetch(`${API_BASE_URL}${path}`, {
            ...init, headers, credentials: "include",
            body: body == null ? undefined : isForm || typeof body === "string" ? body : JSON.stringify(body),
        });
    } catch (cause) {
        if (init.signal?.aborted) throw cause;
        throw clientError("REDE_INDISPONIVEL", "Não foi possível acessar o servidor. Verifique sua conexão.", 0, cause);
    }
}

function assertCurrentSession(version: number): void {
    if (version !== sessionVersion) {
        throw clientError("SESSAO_ALTERADA", "A sessão mudou durante a operação. Atualize os dados.");
    }
}

export function refreshSession(): Promise<LoginResponseDTO> {
    if (pendingRefresh) return pendingRefresh;
    const version = sessionVersion;
    pendingRefresh = (async () => {
        try {
            const response = await sendRequest("/api/auth/refresh", {
                method: "POST", headers: { "X-CSRF-TOKEN": readCsrfCookie() },
            }, null);
            const data = await parseResponse<LoginResponseDTO>(response);
            assertCurrentSession(version);
            if (!data || typeof data.token !== "string" || !data.token
                || typeof data.expirationAt !== "string") {
                throw clientError("RESPOSTA_API_INVALIDA", "Resposta de renovação inválida.");
            }
            // A renovação mantém a mesma identidade; não invalida consultas concorrentes.
            accessToken = data.token;
            if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
            return data;
        } catch (error) {
            if (version === sessionVersion) setAccessToken(null);
            throw error;
        }
    })().finally(() => { pendingRefresh = null; });
    return pendingRefresh;
}

// Serializa login/logout com a rotação de cookies já iniciada.
export async function finishPendingRefresh(): Promise<void> {
    await pendingRefresh?.catch(() => undefined);
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const authenticated = options.authenticated !== false && !path.startsWith("/api/auth/");
    const version = sessionVersion;
    const sentToken = authenticated ? accessToken : null;
    let response = await sendRequest(path, options, sentToken);
    if (authenticated) assertCurrentSession(version);
    if (authenticated && sentToken && response.status === 401) {
        // Uma resposta 401 atrasada reutiliza o token já renovado por outra consulta.
        if (accessToken === sentToken) await refreshSession();
        assertCurrentSession(version);
        options.signal?.throwIfAborted();
        response = await sendRequest(path, options, accessToken);
        assertCurrentSession(version);
        if (response.status === 401) setAccessToken(null);
    }
    const data = await parseResponse<T>(response);
    if (authenticated) assertCurrentSession(version);
    return data;
}

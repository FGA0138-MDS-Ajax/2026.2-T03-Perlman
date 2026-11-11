export type Tema = "dark" | "light" | "system";

export interface Preferencias {
    tema: Tema
}

const STORAGE_KEY = "@app:preferencias";

function preferenciasValidas(valor: unknown): valor is Preferencias {
    if (typeof valor !== "object" || valor === null || !("tema" in valor)) return false;

    const tema = (valor as Record<string, unknown>).tema;
    return tema === "light" || tema === "dark" || tema === "system";
}

export async function buscarPreferencias(signal?: AbortSignal): Promise<Preferencias> {
    const padrao: Preferencias = { tema: "system" };


    if (typeof window === "undefined") {
        return padrao;
    }

    try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (!item) return padrao;

        const parseado = JSON.parse(item);
        if (preferenciasValidas(parseado)) {
            return parseado;
        }
    } catch (erro) {
        console.warn("Erro ao buscar preferências no localStorage:", erro);
    }

    return padrao;
}

export async function salvarTema(tema: Tema, signal?: AbortSignal): Promise<Preferencias> {
    const preferencias: Preferencias = { tema };

    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preferencias));
        } catch (erro) {
            console.error("Erro ao salvar o tema no localStorage:", erro);
        }
    }

    return preferencias;
}

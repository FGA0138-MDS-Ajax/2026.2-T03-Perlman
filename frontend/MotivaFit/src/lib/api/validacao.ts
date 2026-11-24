// Validadores pequenos reutilizados pelos clientes da API.
export function objeto(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === "object" && valor !== null;
}

export function inteiro(valor: unknown): valor is number {
    return typeof valor === "number" && Number.isSafeInteger(valor);
}

export function texto(valor: unknown): valor is string {
    return typeof valor === "string";
}

export function textoOuNulo(valor: unknown): boolean {
    return valor === null || valor === undefined || typeof valor === "string";
}

export function numeroOuNulo(valor: unknown): boolean {
    return valor === null || valor === undefined || typeof valor === "number";
}

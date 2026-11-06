export const FUSO_NEGOCIO = "America/Sao_Paulo";

const dataCivil = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO_NEGOCIO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

export function chaveDiaNegocio(instante: Date): string {
    return dataCivil.format(instante);
}

export function diaAnterior(chave: string): string {
    const [ano, mes, dia] = chave.split("-").map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    data.setUTCDate(data.getUTCDate() - 1);
    const mesTexto = String(data.getUTCMonth() + 1).padStart(2, "0");
    const diaTexto = String(data.getUTCDate()).padStart(2, "0");
    return `${data.getUTCFullYear()}-${mesTexto}-${diaTexto}`;
}

function diaDaSemana(chave: string): number {
    const [ano, mes, dia] = chave.split("-").map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia, 15)).getUTCDay();
}

export function inicioDaSemana(hoje: string): string {
    const distanciaDaSegunda = (diaDaSemana(hoje) + 6) % 7;
    let cursor = hoje;
    for (let indice = 0; indice < distanciaDaSegunda; indice += 1) cursor = diaAnterior(cursor);
    return cursor;
}

export function sequenciaDeDias(dias: ReadonlySet<string>, hoje: string): number {
    let cursor = dias.has(hoje) ? hoje : diaAnterior(hoje);
    let sequencia = 0;
    while (dias.has(cursor)) {
        sequencia += 1;
        cursor = diaAnterior(cursor);
    }
    return sequencia;
}

export function resumirExecucoes(
    registros: readonly { executadoEm: string }[],
    agora: Date,
): { execucoesNaSemana: number; sequenciaDias: number } {
    const hoje = chaveDiaNegocio(agora);
    const segunda = inicioDaSemana(hoje);
    const dias = new Set<string>();
    let execucoesNaSemana = 0;
    for (const registro of registros) {
        const instante = new Date(registro.executadoEm);
        if (Number.isNaN(instante.getTime())) continue;
        const chave = chaveDiaNegocio(instante);
        dias.add(chave);
        if (chave >= segunda && chave <= hoje) execucoesNaSemana += 1;
    }
    return { execucoesNaSemana, sequenciaDias: sequenciaDeDias(dias, hoje) };
}

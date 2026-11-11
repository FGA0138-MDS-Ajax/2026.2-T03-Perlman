import { chaveDiaNegocio, inicioDaSemana } from "@/lib/indicadores-execucao";

export type VisaoHistorico = "lista" | "semana" | "mes";

const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const DIAS = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado",
];

function partes(chave: string): [number, number, number] {
    const [ano, mes, dia] = chave.split("-").map(Number);
    return [ano, mes, dia];
}

function formatarChave(ano: number, mes: number, dia: number): string {
    return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function deslocarDia(chave: string, dias: number): string {
    const [ano, mes, dia] = partes(chave);
    const data = new Date(Date.UTC(ano, mes - 1, dia + dias));
    return formatarChave(data.getUTCFullYear(), data.getUTCMonth() + 1, data.getUTCDate());
}

export function inicioDoMes(chave: string): string {
    const [ano, mes] = partes(chave);
    return formatarChave(ano, mes, 1);
}

export function deslocarMes(inicio: string, meses: number): string {
    const [ano, mes] = partes(inicio);
    const data = new Date(Date.UTC(ano, mes - 1 + meses, 1));
    return formatarChave(data.getUTCFullYear(), data.getUTCMonth() + 1, 1);
}

export function intervaloDaSemana(ancora: string): { inicio: string; fim: string } {
    const inicio = inicioDaSemana(ancora);
    return { inicio, fim: deslocarDia(inicio, 6) };
}

export function intervaloDoMes(ancora: string): { inicio: string; fim: string } {
    const inicio = inicioDoMes(ancora);
    const [ano, mes] = partes(inicio);
    const ultimo = new Date(Date.UTC(ano, mes, 0));
    return {
        inicio,
        fim: formatarChave(ultimo.getUTCFullYear(), ultimo.getUTCMonth() + 1, ultimo.getUTCDate()),
    };
}

export function chaveDaExecucao(executadoEm: string): string | null {
    const instante = new Date(executadoEm);
    if (Number.isNaN(instante.getTime())) return null;
    return chaveDiaNegocio(instante);
}

export function execucoesNoIntervalo<T extends { executadoEm: string }>(
    registros: readonly T[],
    inicio: string,
    fim: string,
): T[] {
    return registros.filter((registro) => {
        const chave = chaveDaExecucao(registro.executadoEm);
        return chave !== null && chave >= inicio && chave <= fim;
    });
}

export function agruparPorDia<T extends { executadoEm: string }>(
    registros: readonly T[],
): { dia: string; itens: T[] }[] {
    const grupos: { dia: string; itens: T[] }[] = [];
    for (const registro of registros) {
        const dia = chaveDaExecucao(registro.executadoEm);
        if (!dia) continue;
        const ultimo = grupos[grupos.length - 1];
        if (ultimo && ultimo.dia === dia) ultimo.itens.push(registro);
        else grupos.push({ dia, itens: [registro] });
    }
    return grupos;
}

function rotuloData(chave: string): string {
    const [ano, mes, dia] = partes(chave);
    return `${dia} de ${MESES[mes - 1]} de ${ano}`;
}

export function rotuloIntervalo(inicio: string, fim: string): string {
    const [anoInicio, mesInicio, diaInicio] = partes(inicio);
    const [anoFim, mesFim, diaFim] = partes(fim);
    if (anoInicio === anoFim && mesInicio === mesFim) {
        return `${diaInicio} a ${diaFim} de ${MESES[mesInicio - 1]} de ${anoInicio}`;
    }
    return `${rotuloData(inicio)} a ${rotuloData(fim)}`;
}

export function rotuloMes(inicio: string): string {
    const [ano, mes] = partes(inicio);
    const nome = MESES[mes - 1];
    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} de ${ano}`;
}

export function rotuloDia(chave: string): string {
    const [ano, mes, dia] = partes(chave);
    const semana = new Date(Date.UTC(ano, mes - 1, dia, 12)).getUTCDay();
    const texto = `${DIAS[semana]}, ${dia} de ${MESES[mes - 1]}`;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

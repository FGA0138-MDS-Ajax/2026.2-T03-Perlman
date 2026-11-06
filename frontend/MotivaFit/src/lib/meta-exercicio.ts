import type { ModalidadeBackend } from "@/lib/api/contracts";

export type CamposMeta =
    | { modalidade: "MUSCULACAO"; series: string; repeticoes: string; cargaKg: string }
    | { modalidade: "AEROBICO"; tempoS: string; distanciaM: string };

export function camposVazios(modalidade: ModalidadeBackend): CamposMeta {
    return modalidade === "MUSCULACAO"
        ? { modalidade, series: "", repeticoes: "", cargaKg: "" }
        : { modalidade, tempoS: "", distanciaM: "" };
}

function inteiro(valor: string): number | null {
    if (!/^\d+$/.test(valor.trim())) return null;
    const numero = Number(valor);
    return numero > 0 ? numero : null;
}

function decimal(valor: string, permiteZero: boolean): number | null {
    const texto = valor.trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) return null;
    const numero = Number(texto);
    if (permiteZero) return numero >= 0 ? numero : null;
    return numero > 0 ? numero : null;
}

export function lerMeta(modalidade: ModalidadeBackend, texto: string): CamposMeta | null {
    const limpo = texto.trim();
    if (modalidade === "MUSCULACAO") {
        const encontrado = /^(\d+) séries, (\d+) repetições(?:, (\d+(?:\.\d{1,2})?) kg)?$/.exec(limpo);
        if (!encontrado) return null;
        return { modalidade, series: encontrado[1], repeticoes: encontrado[2], cargaKg: encontrado[3] ?? "" };
    }
    const encontrado = /^(\d+) s(?:, (\d+(?:\.\d{1,2})?) m)?$/.exec(limpo);
    if (!encontrado) return null;
    return { modalidade, tempoS: encontrado[1], distanciaM: encontrado[2] ?? "" };
}

export function validarMeta(campos: CamposMeta, nome: string): string | null {
    if (campos.modalidade === "MUSCULACAO") {
        if (inteiro(campos.series) === null) return `Informe as séries de ${nome}.`;
        if (inteiro(campos.repeticoes) === null) return `Informe as repetições de ${nome}.`;
        if (campos.cargaKg.trim() && decimal(campos.cargaKg, true) === null) {
            return `A carga de ${nome} deve ser um número com até duas casas.`;
        }
        return null;
    }
    if (inteiro(campos.tempoS) === null) return `Informe o tempo de ${nome} em segundos.`;
    if (campos.distanciaM.trim() && decimal(campos.distanciaM, false) === null) {
        return `A distância de ${nome} deve ser maior que zero, com até duas casas.`;
    }
    return null;
}

export function serializarMeta(campos: CamposMeta): string | null {
    if (validarMeta(campos, "") !== null) return null;
    if (campos.modalidade === "MUSCULACAO") {
        const base = `${inteiro(campos.series)} séries, ${inteiro(campos.repeticoes)} repetições`;
        const carga = campos.cargaKg.trim() ? decimal(campos.cargaKg, true) : null;
        return carga === null ? base : `${base}, ${carga} kg`;
    }
    const tempo = inteiro(campos.tempoS);
    const distancia = campos.distanciaM.trim() ? decimal(campos.distanciaM, false) : null;
    return distancia === null ? `${tempo} s` : `${tempo} s, ${distancia} m`;
}

export function paceSegundosPorKm(tempoS: number, distanciaM: number): number | null {
    if (!(tempoS > 0) || !(distanciaM > 0)) return null;
    return Math.round((tempoS * 1000) / distanciaM);
}

export function paceDosCampos(campos: CamposMeta): number | null {
    if (campos.modalidade !== "AEROBICO") return null;
    const tempo = inteiro(campos.tempoS);
    const distancia = campos.distanciaM.trim() ? decimal(campos.distanciaM, false) : null;
    if (tempo === null || distancia === null) return null;
    return paceSegundosPorKm(tempo, distancia);
}

export function formatarMetaVisivel(texto: string): string {
    const musculacao = lerMeta("MUSCULACAO", texto);
    if (musculacao) return serializarMeta(musculacao) ?? texto;
    const aerobico = lerMeta("AEROBICO", texto);
    if (!aerobico || aerobico.modalidade !== "AEROBICO") return texto;
    const base = serializarMeta(aerobico);
    if (!base) return texto;
    const distancia = aerobico.distanciaM.trim() ? Number(aerobico.distanciaM) : 0;
    const pace = paceSegundosPorKm(Number(aerobico.tempoS), distancia);
    return pace === null ? base : `${base}, pace ${pace} s/km`;
}

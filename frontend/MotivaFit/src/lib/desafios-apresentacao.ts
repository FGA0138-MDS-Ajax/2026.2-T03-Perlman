import type {
    DesafioItemRequestDTO,
    DesafioItemResponseDTO,
    DesafioRequestDTO,
    ModalidadeBackend,
    VisibilidadeBackend,
} from "@/lib/api/contracts";

export const MAX_ITENS_DESAFIO = 20;

export function hojeEmSaoPaulo(agora = new Date()): string {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(agora);
}

export function formatarPrazo(data: string): string {
    const [ano, mes, dia] = data.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : data;
}

export function resumoMetas(item: Pick<DesafioItemResponseDTO, "metaCargaKg" | "metaRepeticoes" | "metaSeries" | "metaTempoS" | "metaDistanciaM">): string {
    const partes: string[] = [];
    if (item.metaSeries != null) partes.push(`${item.metaSeries} séries`);
    if (item.metaRepeticoes != null) partes.push(`${item.metaRepeticoes} repetições`);
    if (item.metaCargaKg != null) partes.push(`${item.metaCargaKg} kg`);
    if (item.metaTempoS != null) partes.push(`${item.metaTempoS} s`);
    if (item.metaDistanciaM != null) partes.push(`${item.metaDistanciaM} m`);
    return partes.join(", ") || "Sem metas";
}

export interface ItemFormulario {
    chave: string;
    catalogoId: number;
    nome: string;
    modalidade: ModalidadeBackend;
    metaCargaKg: string;
    metaRepeticoes: string;
    metaSeries: string;
    metaTempoS: string;
    metaDistanciaM: string;
}

export const CAMPOS_META: { campo: keyof Pick<ItemFormulario, "metaSeries" | "metaRepeticoes" | "metaCargaKg" | "metaTempoS" | "metaDistanciaM">; rotulo: string; modalidades: ModalidadeBackend[]; inteiro: boolean; aceitaZero: boolean }[] = [
    { campo: "metaSeries", rotulo: "Séries", modalidades: ["MUSCULACAO"], inteiro: true, aceitaZero: false },
    { campo: "metaRepeticoes", rotulo: "Repetições", modalidades: ["MUSCULACAO"], inteiro: true, aceitaZero: false },
    { campo: "metaCargaKg", rotulo: "Carga (kg)", modalidades: ["MUSCULACAO"], inteiro: false, aceitaZero: true },
    { campo: "metaTempoS", rotulo: "Tempo (s)", modalidades: ["MUSCULACAO", "AEROBICO"], inteiro: true, aceitaZero: false },
    { campo: "metaDistanciaM", rotulo: "Distância (m)", modalidades: ["AEROBICO"], inteiro: false, aceitaZero: false },
];

function texto(valor: number | null): string {
    return valor == null ? "" : String(valor);
}

export function itemDoDesafio(item: DesafioItemResponseDTO): ItemFormulario {
    return {
        chave: `salvo-${item.id}`, catalogoId: item.catalogoId, nome: item.exercicioNome, modalidade: item.modalidade,
        metaCargaKg: texto(item.metaCargaKg), metaRepeticoes: texto(item.metaRepeticoes), metaSeries: texto(item.metaSeries),
        metaTempoS: texto(item.metaTempoS), metaDistanciaM: texto(item.metaDistanciaM),
    };
}

/** Converte o formulário no pedido da API ou devolve a primeira mensagem de erro. */
export function montarPedidoDesafio(dados: {
    titulo: string; descricao: string; prazo: string; visibilidade: VisibilidadeBackend; itens: ItemFormulario[];
}, hoje = hojeEmSaoPaulo()): DesafioRequestDTO | string {
    const titulo = dados.titulo.trim();
    if (!titulo) return "Informe o título do desafio.";
    if (titulo.length > 100) return "O título deve ter no máximo 100 caracteres.";
    if (dados.descricao.trim().length > 1000) return "A descrição deve ter no máximo 1000 caracteres.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.prazo)) return "Informe o prazo do desafio.";
    if (dados.prazo < hoje) return "O prazo não pode estar no passado.";
    if (dados.itens.length === 0) return "Inclua ao menos um exercício.";
    if (dados.itens.length > MAX_ITENS_DESAFIO) return `O desafio pode ter no máximo ${MAX_ITENS_DESAFIO} exercícios.`;
    if (new Set(dados.itens.map((item) => item.catalogoId)).size !== dados.itens.length) return "O mesmo exercício não pode aparecer duas vezes.";
    const itens: DesafioItemRequestDTO[] = [];
    for (const item of dados.itens) {
        const pedido: DesafioItemRequestDTO = { catalogoId: item.catalogoId };
        let metas = 0;
        for (const definicao of CAMPOS_META) {
            if (!definicao.modalidades.includes(item.modalidade)) continue;
            const bruto = item[definicao.campo].trim().replace(",", ".");
            if (!bruto) continue;
            const valor = Number(bruto);
            // O backend aceita carga zero; as demais metas precisam ser positivas.
            const foraDoLimite = definicao.aceitaZero ? valor < 0 : valor <= 0;
            if (!Number.isFinite(valor) || foraDoLimite || definicao.inteiro && !Number.isInteger(valor)) {
                return `${definicao.rotulo} de ${item.nome} deve ser ${definicao.inteiro ? "um número inteiro" : "um número"} ${definicao.aceitaZero ? "maior ou igual a zero" : "maior que zero"}.`;
            }
            pedido[definicao.campo] = valor;
            metas += 1;
        }
        if (metas === 0) return `Informe ao menos uma meta para ${item.nome}.`;
        itens.push(pedido);
    }
    const descricao = dados.descricao.trim();
    return { titulo, prazo: dados.prazo, visibilidade: dados.visibilidade, itens, ...(descricao ? { descricao } : {}) };
}

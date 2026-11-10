import type { CatalogoExercicioResponseDTO, ModalidadeBackend, TipoTreinoBackend, VisibilidadeBackend } from "@/lib/api/contracts";

export const ROTULO_TIPO: Record<TipoTreinoBackend, string> = {
    MUSCULACAO: "Musculação",
    AEROBICO: "Aeróbico",
};

export const ROTULO_VISIBILIDADE: Record<VisibilidadeBackend, string> = {
    PRIVADO: "Privado",
    PUBLICO: "Público",
};

export type FiltroModalidade = ModalidadeBackend | "TODAS";

export function validarNomeTreino(nome: string): string | null {
    const limpo = nome.trim();
    if (!limpo) return "Informe o nome do treino.";
    if (limpo.length > 150) return "O nome do treino deve ter no máximo 150 caracteres.";
    return null;
}

export function formatarDataTreino(iso: string): string {
    const data = new Date(iso);
    if (Number.isNaN(data.getTime())) return "Data indisponível";
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
    }).format(data);
}

export function gruposDoCatalogo(itens: CatalogoExercicioResponseDTO[]): string[] {
    return [...new Set(itens.map((item) => item.grupoMuscular))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function filtrarCatalogo(
    itens: CatalogoExercicioResponseDTO[],
    consulta: { texto: string; grupo: string; modalidade: FiltroModalidade },
): CatalogoExercicioResponseDTO[] {
    const texto = consulta.texto.trim().toLowerCase();
    return itens.filter((item) => {
        const combinaTexto = texto === ""
            || item.nome.toLowerCase().includes(texto)
            || item.grupoMuscular.toLowerCase().includes(texto);
        const combinaGrupo = consulta.grupo === "TODOS" || item.grupoMuscular === consulta.grupo;
        const combinaModalidade = consulta.modalidade === "TODAS" || item.modalidade === consulta.modalidade;
        return combinaTexto && combinaGrupo && combinaModalidade;
    });
}

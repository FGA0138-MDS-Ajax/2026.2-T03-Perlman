/**
 * Utilitário para mapear exercícios do catálogo às suas respectivas imagens
 * da pasta assets/exercicios_academia_v4_laranja.
 */

const imagensGlob = import.meta.glob<string>(
    "@/assets/exercicios_academia_v4_laranja/*.png",
    { eager: true, import: "default" }
);

// Mapeia chaves normalizadas para a URL final empacotada pelo Vite
const mapaImagens: Record<string, string> = {};

for (const [caminho, url] of Object.entries(imagensGlob)) {
    // Exemplo de caminho: "/src/assets/exercicios_academia_v4_laranja/01_supino_reto.png"
    const nomeArquivo = caminho.split("/").pop() ?? "";
    const semExtensao = nomeArquivo.replace(/\.[^/.]+$/, "");
    // Remove o prefixo numérico (ex: "01_supino_reto" -> "supino_reto")
    const chaveSemNumero = semExtensao.replace(/^\d+_/, "").toLowerCase();
    mapaImagens[chaveSemNumero] = url;
    mapaImagens[semExtensao.toLowerCase()] = url;
}

/**
 * Normaliza o nome do exercício (remove acentos, espaços -> underscores, minúsculo)
 */
export function normalizarNomeExercicio(nome: string): string {
    return nome
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

// Mapeamento explícito caso a nomenclatura divirja levemente
const sinonimos: Record<string, string> = {
    supino: "supino_reto",
    triceps: "triceps_pulley",
    agachamento: "agachamento_livre",
    desenvolvimento_de_ombros: "desenvolvimento_ombros",
    panturrilha: "panturrilha_em_pe",
    panturrilhas: "panturrilha_em_pe",
    bike: "bicicleta_ergometrica",
    bicicleta: "bicicleta_ergometrica",
    esteira_eletrica: "esteira",
    remo: "remo_ergometrico",
};

/**
 * Retorna a URL da imagem de um exercício com base no seu nome.
 * Retorna null se não houver imagem correspondente.
 */
export function obterImagemExercicio(nomeExercicio?: string | null): string | null {
    if (!nomeExercicio) return null;

    const normalizado = normalizarNomeExercicio(nomeExercicio);

    // 1. Busca direta no mapa de arquivos
    if (mapaImagens[normalizado]) {
        return mapaImagens[normalizado];
    }

    // 2. Busca por sinônimo
    const chaveSinonimo = sinonimos[normalizado];
    if (chaveSinonimo && mapaImagens[chaveSinonimo]) {
        return mapaImagens[chaveSinonimo];
    }

    // 3. Busca por correspondência parcial (ex: "supino" dentro de "supino_reto")
    for (const [chave, url] of Object.entries(mapaImagens)) {
        if (!/^\d/.test(chave) && (chave.includes(normalizado) || normalizado.includes(chave))) {
            return url;
        }
    }

    // 4. Fallback para caminho público direto caso exista
    return `/assets/exercicios_academia_v4_laranja/${normalizado}.png`;
}


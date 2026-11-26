import { describe, expect, it } from "vitest";
import { normalizarNomeExercicio, obterImagemExercicio } from "@/lib/exercicios-imagens";

describe("imagens do catálogo", () => {
    it("resolve a imagem de Desenvolvimento de ombros", () => {
        expect(normalizarNomeExercicio("Desenvolvimento de ombros")).toBe("desenvolvimento_de_ombros");
        expect(obterImagemExercicio("Desenvolvimento de ombros")).toContain("desenvolvimento_ombros");
    });
});

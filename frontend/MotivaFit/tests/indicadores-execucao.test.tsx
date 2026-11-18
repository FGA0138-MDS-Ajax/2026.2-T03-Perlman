import { describe, expect, it } from 'vitest';
import { chaveDiaNegocio, resumirExecucoes } from '@/lib/indicadores-execucao';

describe('indicadores de execução', () => {
    const agora = new Date('2026-11-06T15:00:00.000Z');

    it('coloca o instante anterior à meia-noite de Brasília no dia anterior', () => {
        expect(chaveDiaNegocio(new Date('2026-11-06T02:30:00.000Z'))).toBe('2026-11-05');
        expect(chaveDiaNegocio(new Date('2026-11-06T03:00:00.000Z'))).toBe('2026-11-06');
    });

    it('conta execuções da semana de Brasília e a sequência de dias, sem transformar o dia em sessão', () => {
        const resumo = resumirExecucoes([
            { executadoEm: '2026-11-06T02:30:00.000Z' },
            { executadoEm: '2026-11-06T03:00:00.000Z' },
            { executadoEm: '2026-11-06T18:00:00.000Z' },
            { executadoEm: '2026-11-02T03:00:00.000Z' },
            { executadoEm: '2026-11-01T02:30:00.000Z' },
        ], agora);

        expect(resumo.execucoesNaSemana).toBe(4);
        expect(resumo.sequenciaDias).toBe(2);
    });

    it('começa a sequência ontem quando hoje ainda não tem execução', () => {
        const resumo = resumirExecucoes([
            { executadoEm: '2026-11-05T15:00:00.000Z' },
            { executadoEm: '2026-11-04T15:00:00.000Z' },
        ], agora);

        expect(resumo.sequenciaDias).toBe(2);
        expect(resumo.execucoesNaSemana).toBe(2);
    });
});

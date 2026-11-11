import { describe, expect, it } from 'vitest';
import {
    agruparPorDia,
    deslocarMes,
    execucoesNoIntervalo,
    intervaloDaSemana,
    intervaloDoMes,
    rotuloDia,
    rotuloIntervalo,
    rotuloMes,
} from '@/lib/historico-periodos';

describe('períodos do histórico', () => {
    it('abre a semana na segunda e fecha no domingo, no calendário de Brasília', () => {
        expect(intervaloDaSemana('2026-11-06')).toEqual({ inicio: '2026-11-02', fim: '2026-11-08' });
        expect(intervaloDaSemana('2026-11-01')).toEqual({ inicio: '2026-10-26', fim: '2026-11-01' });
        expect(rotuloIntervalo('2026-11-02', '2026-11-08')).toBe('2 a 8 de novembro de 2026');
        expect(rotuloIntervalo('2026-10-26', '2026-11-01')).toBe('26 de outubro de 2026 a 1 de novembro de 2026');
    });

    it('desloca o mês civil e respeita fevereiro bissexto', () => {
        expect(intervaloDoMes('2026-11-06')).toEqual({ inicio: '2026-11-01', fim: '2026-11-30' });
        expect(intervaloDoMes('2024-02-15')).toEqual({ inicio: '2024-02-01', fim: '2024-02-29' });
        expect(intervaloDoMes('2026-02-15')).toEqual({ inicio: '2026-02-01', fim: '2026-02-28' });
        expect(deslocarMes('2026-11-01', -1)).toBe('2026-10-01');
        expect(deslocarMes('2026-12-01', 1)).toBe('2027-01-01');
        expect(deslocarMes('2026-01-01', -1)).toBe('2025-12-01');
        expect(rotuloMes('2026-11-01')).toBe('Novembro de 2026');
    });

    it('filtra pelo dia civil de Brasília e agrupa sem perder a ordem', () => {
        const registros = [
            { id: 1, executadoEm: '2026-11-06T02:30:00.000Z' },
            { id: 2, executadoEm: '2026-11-06T15:00:00.000Z' },
            { id: 3, executadoEm: '2026-11-01T02:30:00.000Z' },
            { id: 4, executadoEm: 'data-invalida' },
        ];
        const semana = intervaloDaSemana('2026-11-06');
        expect(execucoesNoIntervalo(registros, semana.inicio, semana.fim).map((item) => item.id)).toEqual([1, 2]);
        expect(execucoesNoIntervalo(registros, '2026-10-01', '2026-10-31').map((item) => item.id)).toEqual([3]);
        expect(agruparPorDia(registros)).toEqual([
            { dia: '2026-11-05', itens: [registros[0]] },
            { dia: '2026-11-06', itens: [registros[1]] },
            { dia: '2026-10-31', itens: [registros[2]] },
        ]);
        expect(rotuloDia('2026-11-06')).toBe('Sexta-feira, 6 de novembro');
        expect(rotuloDia('2026-11-05')).toBe('Quinta-feira, 5 de novembro');
    });
});

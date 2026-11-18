import { describe, expect, it } from 'vitest';
import { formatarMetaVisivel, lerMeta, paceSegundosPorKm, serializarMeta, validarMeta } from '@/lib/meta-exercicio';

describe('meta numérica do exercício', () => {
    it('grava musculação com unidades e relê os campos', () => {
        const campos = { modalidade: 'MUSCULACAO' as const, series: '3', repeticoes: '12', cargaKg: '20,5' };
        expect(validarMeta(campos, 'Supino')).toBeNull();
        expect(serializarMeta(campos)).toBe('3 séries, 12 repetições, 20.5 kg');
        expect(lerMeta('MUSCULACAO', '3 séries, 12 repetições, 20.5 kg')).toEqual({
            modalidade: 'MUSCULACAO', series: '3', repeticoes: '12', cargaKg: '20.5',
        });
    });

    it('calcula o pace em segundos por quilômetro só com distância positiva', () => {
        expect(paceSegundosPorKm(600, 5000)).toBe(120);
        expect(paceSegundosPorKm(600, 0)).toBeNull();
        expect(formatarMetaVisivel('600 s, 5000 m')).toBe('600 s, 5000 m, pace 120 s/km');
        expect(formatarMetaVisivel('600 s')).toBe('600 s');
        expect(formatarMetaVisivel('3x12')).toBe('3x12');
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { setAccessToken } from '@/lib/api/http-client';
import PaginaDesafios from '@/pages-user/pagina-desafios';
import { montarPedidoDesafio, resumoMetas } from '@/lib/desafios-apresentacao';
import { chamadas, corpo, montar, sessao, type Responder } from './suporte-api';

const supino = { id: 1, nome: 'Supino reto', modalidade: 'MUSCULACAO', grupoMuscular: 'Peito' };
const corrida = { id: 2, nome: 'Corrida', modalidade: 'AEROBICO', grupoMuscular: 'Cardio' };
const item = (id: number, catalogoId: number, nome: string, modalidade: string, metas: Record<string, number>) => ({
    id, catalogoId, exercicioNome: nome, modalidade,
    metaCargaKg: null, metaRepeticoes: null, metaSeries: null, metaTempoS: null, metaDistanciaM: null, ...metas,
});
const desafio = (id: number, titulo: string, extra: Record<string, unknown> = {}) => ({
    id, titulo, prazo: '2099-12-15', descricao: null, visibilidade: 'PUBLICO', estado: 'ATIVO', souCriador: false,
    itens: [item(id * 10, 1, 'Supino reto', 'MUSCULACAO', { metaRepeticoes: 100 })], ...extra,
});
const meu = desafio(7, 'Meu desafio', { souCriador: true, visibilidade: 'PRIVADO' });
const convidado = desafio(8, 'Desafio com convite');
const aberto = desafio(9, 'Desafio aberto');
const participantes: Record<number, unknown[]> = {
    7: [{ usuarioId: 42, email: 'aluno@example.com', estado: 'ACEITO', aceitoEm: null }],
    8: [{ usuarioId: 5, email: 'dono@example.com', estado: 'ACEITO', aceitoEm: null },
        { usuarioId: 42, email: 'aluno@example.com', estado: 'CONVIDADO', aceitoEm: null }],
    9: [{ usuarioId: 5, email: 'dono@example.com', estado: 'ACEITO', aceitoEm: null }],
};

function api(extra?: Responder): Responder {
    return (url, init) => {
        if (url.includes('/api/auth/refresh')) return sessao();
        const proprio = extra?.(url, init);
        if (proprio) return proprio;
        const participantesDe = url.match(/\/api\/desafios\/(\d+)\/participantes$/);
        if (participantesDe) return Response.json(participantes[Number(participantesDe[1])] ?? []);
        if (url.includes('/api/catalogo-exercicios')) return Response.json([supino, corrida]);
        if (url.includes('/api/amizades')) return Response.json([{ id: 3, solicitanteId: 42, solicitanteEmail: 'aluno@example.com',
            destinatarioId: 15, destinatarioEmail: 'amigo@example.com', estado: 'ACEITA', criadoEm: '2026-11-20T10:00:00Z', atualizadoEm: '2026-11-20T10:00:00Z' }]);
        if (url === '/api/desafios') return Response.json([meu, convidado, aberto]);
        return Response.json({}, { status: 404 });
    };
}

beforeEach(() => { localStorage.clear(); setAccessToken(null); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('desafios integrados à API', () => {
    it('separa meus desafios, convites e públicos e descarta os dados locais antigos', async () => {
        localStorage.setItem('@motivafit:desafios', '[{"id":"local"}]');
        const gravar = vi.spyOn(Storage.prototype, 'setItem');
        montar('/desafios', '/desafios', <PaginaDesafios />, api());
        expect(await screen.findByRole('heading', { name: 'Meu desafio' })).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Desafio aberto' })).toBeNull();
        fireEvent.click(screen.getByRole('tab', { name: /Convites \(1\)/ }));
        expect(screen.getByRole('heading', { name: 'Desafio com convite' })).toBeTruthy();
        fireEvent.click(screen.getByRole('tab', { name: 'Desafios públicos' }));
        expect(screen.getByRole('heading', { name: 'Desafio aberto' })).toBeTruthy();
        expect(screen.getByText(/peça um convite/)).toBeTruthy();
        expect(localStorage.getItem('@motivafit:desafios')).toBeNull();
        expect(gravar).not.toHaveBeenCalled();
    });

    it('aceita um convite pela API', async () => {
        montar('/desafios', '/desafios', <PaginaDesafios />, api((url, init) => init?.method === 'PATCH'
            ? Response.json({ usuarioId: 42, email: 'aluno@example.com', estado: 'ACEITO', aceitoEm: '2026-11-20T10:00:00Z' }) : undefined));
        fireEvent.click(await screen.findByRole('tab', { name: /Convites/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Ver detalhes de Desafio com convite' }));
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
        await waitFor(() => expect(chamadas('PATCH')).toHaveLength(1));
        expect(String(chamadas('PATCH')[0][0])).toBe('/api/desafios/8/participantes/me');
        expect(corpo(chamadas('PATCH')[0])).toEqual({ estado: 'ACEITO' });
    });

    it('cria desafio com metas do catálogo e convida um amigo', async () => {
        montar('/desafios', '/desafios', <PaginaDesafios />, api((url, init) => {
            if (url === '/api/desafios' && init?.method === 'POST') return Response.json({ ...meu, ...corpo([url, init]), id: 7, souCriador: true,
                itens: [item(70, 2, 'Corrida', 'AEROBICO', { metaDistanciaM: 5000 })] }, { status: 201 });
            if (url === '/api/desafios/7/participantes' && init?.method === 'POST') return Response.json(
                { usuarioId: 15, email: 'amigo@example.com', estado: 'CONVIDADO', aceitoEm: null }, { status: 201 });
            return undefined;
        }));
        fireEvent.click(await screen.findByRole('button', { name: 'Criar desafio' }));
        const dialogo = await screen.findByRole('dialog', { name: 'Novo desafio' });
        fireEvent.change(within(dialogo).getByLabelText('Título'), { target: { value: '  5 km  ' } });
        fireEvent.change(within(dialogo).getByLabelText('Prazo (último dia)'), { target: { value: '2099-12-31' } });
        fireEvent.change(await within(dialogo).findByLabelText('Exercício do catálogo'), { target: { value: '2' } });
        fireEvent.click(within(dialogo).getByRole('button', { name: 'Incluir exercício' }));
        fireEvent.click(within(dialogo).getByRole('button', { name: 'Criar desafio' }));
        expect((await within(dialogo).findByRole('alert')).textContent).toContain('Informe ao menos uma meta para Corrida');
        expect(within(dialogo).queryByLabelText('Carga (kg) de Corrida')).toBeNull();
        fireEvent.change(within(dialogo).getByLabelText('Distância (m) de Corrida'), { target: { value: '5000' } });
        fireEvent.click(within(dialogo).getByRole('button', { name: 'Criar desafio' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
        const criacao = chamadas('POST').find(([url]) => url === '/api/desafios')!;
        expect(corpo(criacao)).toEqual({ titulo: '5 km', prazo: '2099-12-31', visibilidade: 'PRIVADO', itens: [{ catalogoId: 2, metaDistanciaM: 5000 }] });
        fireEvent.change(await screen.findByLabelText('Amigo'), { target: { value: '15' } });
        fireEvent.click(screen.getByRole('button', { name: 'Convidar' }));
        await waitFor(() => expect(chamadas('POST').some(([url]) => url === '/api/desafios/7/participantes')).toBe(true));
        expect(corpo(chamadas('POST').find(([url]) => url === '/api/desafios/7/participantes')!)).toEqual({ usuarioId: 15 });
    });

    it('valida o pedido antes de enviar', () => {
        const base = { titulo: 'Desafio', descricao: '', prazo: '2026-11-25', visibilidade: 'PUBLICO' as const, itens: [] };
        const musculacao = { chave: 'a', catalogoId: 1, nome: 'Supino', modalidade: 'MUSCULACAO' as const,
            metaCargaKg: '80,5', metaRepeticoes: '', metaSeries: '3', metaTempoS: '', metaDistanciaM: '999' };
        expect(montarPedidoDesafio(base, '2026-11-26')).toBe('O prazo não pode estar no passado.');
        expect(montarPedidoDesafio(base, '2026-11-25')).toBe('Inclua ao menos um exercício.');
        expect(montarPedidoDesafio({ ...base, itens: [musculacao, { ...musculacao, chave: 'b' }] }, '2026-11-25')).toContain('duas vezes');
        expect(montarPedidoDesafio({ ...base, itens: [{ ...musculacao, metaSeries: '2.5' }] }, '2026-11-25')).toContain('inteiro');
        expect(montarPedidoDesafio({ ...base, itens: [musculacao] }, '2026-11-25')).toEqual({
            titulo: 'Desafio', prazo: '2026-11-25', visibilidade: 'PUBLICO', itens: [{ catalogoId: 1, metaSeries: 3, metaCargaKg: 80.5 }],
        });
        expect(resumoMetas({ metaCargaKg: 80, metaRepeticoes: null, metaSeries: 3, metaTempoS: null, metaDistanciaM: null })).toBe('3 séries, 80 kg');
    });
});

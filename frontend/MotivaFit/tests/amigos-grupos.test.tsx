import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { setAccessToken } from '@/lib/api/http-client';
import PaginaAmigos from '@/pages-user/pagina-amigos';
import PaginaGrupos from '@/pages-user/pagina-grupos';
import { amigosDe } from '@/lib/api/amizades-api';
import { linkDeConvite } from '@/lib/grupos-apresentacao';
import { chamadas, corpo, erro, montar, sessao } from './suporte-api';

const data = '2026-11-20T10:00:00Z';
const amizade = (id: number, solicitante: [number, string], destinatario: [number, string], estado: string) => ({
    id, solicitanteId: solicitante[0], solicitanteEmail: solicitante[1],
    destinatarioId: destinatario[0], destinatarioEmail: destinatario[1], estado, criadoEm: data, atualizadoEm: data,
});
const eu: [number, string] = [42, 'aluno@example.com'];
const amizades = [
    amizade(1, [10, 'recebida@example.com'], eu, 'PENDENTE'),
    amizade(2, eu, [11, 'enviada@example.com'], 'PENDENTE'),
    amizade(3, [12, 'amiga@example.com'], eu, 'ACEITA'),
];

beforeEach(() => { setAccessToken(null); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('amizades', () => {
    it('separa solicitações e envia, aceita e desfaz pela API', async () => {
        montar('/amigos', '/amigos', <PaginaAmigos />, (url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (init?.method === 'POST') return Response.json(amizade(4, eu, [15, 'novo@example.com'], 'PENDENTE'), { status: 201 });
            if (init?.method === 'PATCH') return Response.json({ ...amizades[0], estado: 'ACEITA' });
            if (init?.method === 'DELETE') return new Response(null, { status: 204 });
            return Response.json(amizades);
        });
        const recebidas = await screen.findByRole('list', { name: 'Solicitações recebidas' });
        expect(within(recebidas).getByText('recebida@example.com')).toBeTruthy();
        expect(within(screen.getByRole('list', { name: 'Solicitações enviadas' })).getByText('enviada@example.com')).toBeTruthy();
        expect(within(screen.getByRole('list', { name: 'Amigos' })).getByText('amiga@example.com')).toBeTruthy();

        fireEvent.change(screen.getByLabelText('ID da conta'), { target: { value: '42' } });
        fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitação' }));
        expect((await screen.findByRole('alert')).textContent).toContain('si mesmo');
        expect(chamadas('POST')).toHaveLength(0);
        fireEvent.change(screen.getByLabelText('ID da conta'), { target: { value: '15' } });
        fireEvent.click(screen.getByRole('button', { name: 'Enviar solicitação' }));
        await waitFor(() => expect(chamadas('POST')).toHaveLength(1));
        expect(corpo(chamadas('POST')[0])).toEqual({ destinatarioId: 15 });

        fireEvent.click(await screen.findByRole('button', { name: 'Aceitar recebida@example.com' }));
        await waitFor(() => expect(chamadas('PATCH')).toHaveLength(1));
        expect(String(chamadas('PATCH')[0][0])).toBe('/api/amizades/1');
        expect(corpo(chamadas('PATCH')[0])).toEqual({ estado: 'ACEITA' });

        fireEvent.click(await screen.findByRole('button', { name: 'Desfazer amizade com amiga@example.com' }));
        await waitFor(() => expect(chamadas('DELETE').map(([url]) => String(url))).toEqual(['/api/amizades/3']));
    });

    it('converte amizades aceitas na lista de amigos', () => {
        expect(amigosDe(amizades, 42)).toEqual([{ amizadeId: 3, usuarioId: 12, email: 'amiga@example.com' }]);
    });
});

describe('grupos', () => {
    const grupo = { id: 5, nome: 'Corredores', descricao: 'Corridas de domingo', criadorId: 42, papel: 'ADMIN', criadoEm: data, atualizadoEm: data };

    it('aceita convite recebido por link e mostra o erro da API', async () => {
        let falhar = true;
        montar('/grupos?convite=abc-123', '/grupos', <PaginaGrupos />, (url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url === '/api/grupos/convites/aceite') {
                if (falhar) { falhar = false; return erro(400, 'O convite expirou', 'CONVITE_EXPIRADO'); }
                return new Response(null, { status: 204 });
            }
            return Response.json(init?.method ? {} : []);
        });
        expect((await screen.findByLabelText('Token do convite') as HTMLInputElement).value).toBe('abc-123');
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
        expect((await screen.findByRole('alert')).textContent).toContain('O convite expirou');
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
        expect(await screen.findByText(/Você agora faz parte do grupo/)).toBeTruthy();
        expect(chamadas('POST').map(corpo)).toEqual([{ token: 'abc-123' }, { token: 'abc-123' }]);
    });

    it('abre o grupo com membros e feed e gera convite para amigo', async () => {
        montar('/grupos', '/grupos', <PaginaGrupos />, (url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url === '/api/grupos/5/membros') return Response.json([
                { usuarioId: 42, email: 'aluno@example.com', papel: 'ADMIN', entradaEm: data },
                { usuarioId: 13, email: 'membro@example.com', papel: 'MEMBRO', entradaEm: data },
            ]);
            if (url === '/api/grupos/5/feed') return Response.json([{ id: 1, usuarioId: 13, tipo: 'MEMBRO_ENTROU', conteudo: 'Entrou no grupo', criadoEm: data }]);
            if (url === '/api/grupos/5/convites') return Response.json({ id: 9, grupoId: 5, convidadoId: 12, token: 'tok-9', expiraEm: data }, { status: 201 });
            if (url.includes('/api/amizades')) return Response.json(amizades);
            if (url === '/api/grupos' && !init?.method) return Response.json([grupo]);
            return Response.json({}, { status: 404 });
        });
        fireEvent.click(await screen.findByRole('button', { name: 'Abrir Corredores' }));
        expect(await screen.findByText('membro@example.com')).toBeTruthy();
        expect(await screen.findByText('Entrou no grupo')).toBeTruthy();
        expect(screen.getByText(/membro@example.com ·/)).toBeTruthy();
        fireEvent.change(await screen.findByLabelText('Amigo'), { target: { value: '12' } });
        fireEvent.click(screen.getByRole('button', { name: 'Gerar convite' }));
        expect(await screen.findByText(linkDeConvite('tok-9'))).toBeTruthy();
        expect(corpo(chamadas('POST')[0])).toEqual({ usuarioId: 12 });
    });
});

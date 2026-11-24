import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getAccessToken, setAccessToken } from '@/lib/api/http-client';
import { loginGoogle } from '@/lib/api/auth-api';
import PaginaConta from '@/pages-user/pagina-conta';
import { chamadas, corpo, erro, montar, sessao, token } from './suporte-api';

beforeEach(() => { setAccessToken(null); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.doUnmock('@/lib/auth-context'); setAccessToken(null); });

describe('minha conta', () => {
    it('mostra os dados retornados pela API e aceita convite de administrador renovando a sessão', async () => {
        let refreshes = 0;
        montar('/conta', '/conta', <PaginaConta />, (url, init) => {
            if (url.includes('/api/auth/refresh')) { refreshes += 1; return sessao(); }
            if (url === '/api/admin/convites/aceite') return new Response(null, { status: 204 });
            if (url === '/api/conta/42' && !init?.method) return Response.json({ id: 42, email: 'aluno@example.com', perfil: 'USUARIO', ativo: true });
            return Response.json({}, { status: 404 });
        });
        expect(await screen.findByText('42')).toBeTruthy();
        expect(screen.getByText('Usuário')).toBeTruthy();
        expect(screen.getByText('Ativa')).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Token do convite'), { target: { value: 'a'.repeat(43) } });
        const antes = refreshes;
        fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
        expect(await screen.findByText('Convite aceito. Seu perfil foi atualizado.')).toBeTruthy();
        expect(corpo(chamadas('POST')[0])).toEqual({ usuarioId: 42, token: 'a'.repeat(43) });
        expect(refreshes).toBe(antes + 1);
    });
});

describe('login com Google', () => {
    it('troca o ID Token por uma sessão', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() })));
        await loginGoogle({ idToken: 'id-token-google' });
        const [url, init] = vi.mocked(fetch).mock.calls[0];
        expect(url).toBe('/api/auth/google');
        expect(JSON.parse(String(init?.body))).toEqual({ idToken: 'id-token-google' });
        expect(getAccessToken()).toMatch(/^header\./);
    });

    it('propaga a recusa do backend sem abrir sessão', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => erro(401, 'Token do Google inválido', 'GOOGLE_TOKEN_INVALIDO')));
        await expect(loginGoogle({ idToken: 'ruim' })).rejects.toThrow('Token do Google inválido');
        expect(getAccessToken()).toBeNull();
    });
});

describe('métricas administrativas', () => {
    it('mostra cada seção de forma independente e respeita o ranking oculto', async () => {
        vi.doMock('@/lib/auth-context', async (importOriginal) => ({
            ...await importOriginal<typeof import('@/lib/auth-context')>(),
            useAuth: () => ({ user: { id: '1', email: 'admin@example.com', nome: 'Admin', perfil: 'ADMINISTRADOR' }, isSuperusuario: false, logout: vi.fn(), enviando: false }),
        }));
        const { default: PaginaMetricasAdmin } = await import('@/pages-admin/pagina-metricas-admin');
        setAccessToken('teste');
        vi.stubGlobal('fetch', vi.fn(async (url: string) => {
            if (url.includes('/usuarios-ativos')) return Response.json({ totalContas: 20, ativosNoPeriodo: 5, percentualAtivos: 25, serie: [] });
            if (url.includes('/frequencia-media')) return erro(500, 'Falha na frequência');
            if (url.includes('/ranking-tempo-treino')) return Response.json({ tempoTotalS: 7260, mediaPorUsuarioAtivoS: 3600, medianaPorUsuarioAtivoS: null, ocultoPorPrivacidade: true, ranking: [] });
            if (url.includes('/exercicios-mais-realizados')) return Response.json({ suprimidos: 2, ranking: [{ posicao: 1, catalogoId: 1, nome: 'Supino reto', modalidade: 'MUSCULACAO', grupoMuscular: 'Peito', execucoes: 30, usuariosDistintos: 6 }] });
            if (url.includes('/rotinas')) return Response.json({ treinosAtivos: 12, porTipo: [{ tipo: 'MUSCULACAO', treinos: 9 }], percentualTreinosPublicos: 25, percentualRegistrosComTreino: 80,
                treinosPublicosMaisAdicionados: [{ posicao: 1, treinoId: 3, nome: 'Full body', adicoes: 4, usuariosDistintos: 4 }] });
            if (url.includes('/retencao')) return Response.json({ ate: '2026-11-23', taxaAtivacao7Dias: 0, medianaDiasAtePrimeiroRegistro: null, coortes: [] });
            return Response.json({}, { status: 404 });
        }));
        render(<MemoryRouter><PaginaMetricasAdmin /></MemoryRouter>);
        expect(await screen.findByText('Supino reto')).toBeTruthy();
        expect(screen.getAllByText('25%')).toHaveLength(2);
        expect(screen.getByText('2 h 1 min')).toBeTruthy();
        expect(screen.getByText(/Ranking oculto/)).toBeTruthy();
        expect(screen.getByText('Full body')).toBeTruthy();
        expect(screen.getByText(/2 exercício\(s\) omitido\(s\)/)).toBeTruthy();
        expect(screen.getByText('Ainda não há coortes calculadas.')).toBeTruthy();
        expect(screen.getByRole('alert').textContent).toContain('Falha na frequência');

        fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-11-10' } });
        fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-11-01' } });
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar período' }));
        expect(screen.getAllByRole('alert').some((item) => item.textContent?.includes('data inicial'))).toBe(true);
        fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-11-20' } });
        fireEvent.click(screen.getByRole('button', { name: 'Aplicar período' }));
        await waitFor(() => expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes('usuarios-ativos?de=2026-11-10&ate=2026-11-20'))).toBe(true));
    });
});

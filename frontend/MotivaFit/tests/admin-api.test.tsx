import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaDashboardAdmin from '@/pages-admin/pagina-dashboard-admin';
import PaginaRelatoriosAdmin from '@/pages-admin/pagina-relatorios-admin';
import PaginaTreinosAdmin from '@/pages-admin/pagina-treinos-admin';
import { setAccessToken } from '@/lib/api/http-client';

vi.mock('@/lib/auth-context', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/lib/auth-context')>(),
    useAuth: () => ({ user: { id: '1', email: 'admin@example.com', nome: 'Admin' }, isSuperusuario: false, logout: vi.fn(), enviando: false }),
}));
const usuario = { id: 2, email: 'aluno@example.com', ativo: true, fichas: 2, execucoes: 7, ultimaExecucao: '2026-11-11T12:00:00Z' };
const erro = () => Response.json({ codigo: 'ERRO', mensagem: 'Serviço indisponível', dataHora: '2026-11-11T12:00:00Z' }, { status: 503 });
beforeEach(() => { setAccessToken('teste'); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('administração pela API', () => {
    it('usa totais globais no dashboard sem consultar dados do navegador', async () => {
        const leitura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage proibido'); });
        vi.stubGlobal('fetch', vi.fn((url: string) => {
            if (String(url).includes('/api/conta/exportacao')) return Promise.resolve(Response.json([usuario]));
            if (String(url).includes('/usuarios-ativos')) return Promise.resolve(Response.json({ ativosNoPeriodo: 4 }));
            if (String(url).includes('/rotinas')) return Promise.resolve(Response.json({ treinosAtivos: 12 }));
            if (String(url).includes('/exercicios-mais-realizados')) return Promise.resolve(Response.json({ ranking: [{ execucoes: 90 }] }));
            return Promise.resolve(Response.json({}, { status: 404 }));
        }));
        render(<MemoryRouter><PaginaDashboardAdmin /></MemoryRouter>);
        expect(screen.getByRole('status')).toBeTruthy();
        expect(await screen.findByText('90')).toBeTruthy();
        expect(screen.getByText('12')).toBeTruthy();
        expect(screen.queryByText('Treinos realizados')).toBeNull();
        expect(leitura).not.toHaveBeenCalled();
        expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes('/api/conta/exportacao'))).toBe(true);
    });
    it('pagina os usuários mantendo os totais globais e permite atualizar', async () => {
        const contas = Array.from({ length: 51 }, (_, index) => index === 0
            ? usuario
            : { id: index + 2, email: `aluno${index + 1}@example.com`, ativo: true });
        vi.stubGlobal('fetch', vi.fn((url: string) => {
            if (String(url).includes('/api/conta/exportacao')) return Promise.resolve(Response.json(contas));
            if (String(url).includes('/usuarios-ativos')) return Promise.resolve(Response.json({ ativosNoPeriodo: 4 }));
            if (String(url).includes('/rotinas')) return Promise.resolve(Response.json({ treinosAtivos: 12 }));
            if (String(url).includes('/exercicios-mais-realizados')) return Promise.resolve(Response.json({ ranking: [{ execucoes: 90 }] }));
            return Promise.resolve(Response.json({}, { status: 404 }));
        }));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect(await screen.findByText('aluno@example.com')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
        expect(await screen.findByText('aluno51@example.com')).toBeTruthy();
        expect(screen.queryByText('aluno@example.com')).toBeNull();
        expect(screen.getByText('90')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Próxima' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Atualizar dados' }));
        await waitFor(() => expect(fetch).toHaveBeenCalled());
    });
    it('não converte erro da API em zero e permite nova tentativa', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => erro())
            .mockImplementation(async (url: string) => {
                if (String(url).includes('/api/conta/exportacao')) return Response.json([]);
                if (String(url).includes('/usuarios-ativos')) return Response.json({ ativosNoPeriodo: 0 });
                if (String(url).includes('/rotinas')) return Response.json({ treinosAtivos: 0 });
                if (String(url).includes('/exercicios-mais-realizados')) return Response.json({ ranking: [] });
                return Response.json({}, { status: 404 });
            }));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('Serviço indisponível');
        expect(screen.queryByText('0')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhum usuário encontrado.')).toBeTruthy();
    });
    it('lista fichas reais com proprietário e rejeita resposta inválida', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => Response.json({}))
            .mockImplementation(async () => Response.json([{ id: 7, nome: 'Ficha real', tipo: 'MUSCULACAO', visibilidade: 'PRIVADO', meuTreino: false, podeEditar: false, createdAt: '2026-11-11T12:00:00Z', updatedAt: '2026-11-11T12:00:00Z' }])));
        render(<MemoryRouter><PaginaTreinosAdmin /></MemoryRouter>);
        await screen.findByRole('alert');
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Ficha real')).toBeTruthy();
        expect(screen.getByText('Fichas disponíveis nesta sessão')).toBeTruthy();
        expect(screen.queryByText('Hipertrofia - Iniciante')).toBeNull();
    });
});

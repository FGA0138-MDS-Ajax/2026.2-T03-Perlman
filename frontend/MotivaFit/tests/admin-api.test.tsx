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
const resumo = { totalUsuarios: 51, totalFichas: 12, totalExecucoes: 90, usuariosComFichas: 8, usuariosAtivos30Dias: 4 };
const usuario = { id: 2, email: 'aluno@example.com', ativo: true, fichas: 2, execucoes: 7, ultimaExecucao: '2026-11-11T12:00:00Z' };
const erro = () => Response.json({ codigo: 'ERRO', mensagem: 'Serviço indisponível', dataHora: '2026-11-11T12:00:00Z' }, { status: 503 });
beforeEach(() => { setAccessToken('teste'); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('administração pela API', () => {
    it('usa totais globais no dashboard sem consultar dados do navegador', async () => {
        const leitura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage proibido'); });
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ resumo, usuarios: [usuario] })));
        render(<MemoryRouter><PaginaDashboardAdmin /></MemoryRouter>);
        expect(screen.getByRole('status')).toBeTruthy();
        expect(await screen.findByText('90')).toBeTruthy();
        expect(screen.getByText('12')).toBeTruthy();
        expect(screen.queryByText('Treinos realizados')).toBeNull();
        expect(leitura).not.toHaveBeenCalled();
        expect(String(vi.mocked(fetch).mock.calls[0][0])).toContain('/api/admin/relatorios');
    });
    it('pagina os usuários mantendo os totais globais e permite atualizar', async () => {
        vi.stubGlobal('fetch', vi.fn((url: string) => Promise.resolve(Response.json({ resumo,
            usuarios: String(url).includes('pagina=1') ? [{ ...usuario, id: 3, email: 'outro@example.com' }] : [usuario],
        }))));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect(await screen.findByText('aluno@example.com')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
        expect(await screen.findByText('outro@example.com')).toBeTruthy();
        expect(screen.queryByText('aluno@example.com')).toBeNull();
        expect(screen.getByText('90')).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Próxima' }).hasAttribute('disabled')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Atualizar dados' }));
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    });
    it('não converte erro da API em zero e permite nova tentativa', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => erro())
            .mockImplementation(async () => Response.json({ resumo: { ...resumo, totalUsuarios: 0, totalFichas: 0, totalExecucoes: 0, usuariosComFichas: 0, usuariosAtivos30Dias: 0 }, usuarios: [] })));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('Serviço indisponível');
        expect(screen.queryByText('0')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhum usuário encontrado.')).toBeTruthy();
    });
    it('lista fichas reais com proprietário e rejeita resposta inválida', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => Response.json([]))
            .mockImplementation(async () => Response.json({ total: 1, itens: [{ id: 7, nome: 'Ficha real', usuarioEmail: usuario.email, tipo: 'MUSCULACAO', visibilidade: 'PRIVADO' }] })));
        render(<MemoryRouter><PaginaTreinosAdmin /></MemoryRouter>);
        await screen.findByRole('alert');
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Ficha real')).toBeTruthy();
        expect(screen.getByText(usuario.email)).toBeTruthy();
        expect(screen.queryByText('Hipertrofia - Iniciante')).toBeNull();
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { ThemeSelector } from '@/components/theme-toggle';
import { setAccessToken } from '@/lib/api/http-client';

const sessao = vi.hoisted(() => ({ user: { id: '1' } as { id: string } | null }));
vi.mock('@/lib/auth-context', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/lib/auth-context')>(), useAuth: () => sessao,
}));
function Conteudo() { const { theme } = useTheme(); return <><output data-testid="tema">{theme}</output><ThemeSelector /></>; }
function Tela() { return <ThemeProvider><Conteudo /></ThemeProvider>; }
beforeEach(() => { sessao.user = { id: '1' }; setAccessToken('teste'); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); document.documentElement.classList.remove('dark', 'light'); });

describe('tema da conta', () => {
    it('carrega e salva pela API sem acessar localStorage ou sessionStorage', async () => {
        const leitura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('proibido'); });
        const gravacao = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('proibido'); });
        vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => Promise.resolve(Response.json({ tema: init?.method === 'PUT' ? JSON.parse(String(init.body)).tema : 'dark' }))));
        render(<Tela />);
        await waitFor(() => expect(screen.getByTestId('tema').textContent).toBe('dark'));
        fireEvent.click(screen.getByRole('button', { name: 'Claro' }));
        await waitFor(() => expect(screen.getByTestId('tema').textContent).toBe('light'));
        expect(vi.mocked(fetch).mock.calls[1][1]).toMatchObject({ method: 'PUT', body: '{"tema":"light"}' });
        expect(leitura).not.toHaveBeenCalled(); expect(gravacao).not.toHaveBeenCalled();
    });
    it('aplica o tema mesmo quando a API falha e permite salvar novamente', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => Response.json({ tema: 'dark' }))
            .mockImplementationOnce(async () => Response.json({ codigo: 'ERRO', mensagem: 'Falha', dataHora: '2026-11-11T12:00:00Z' }, { status: 500 }))
            .mockImplementation(async () => Response.json({ tema: 'light' })));
        render(<Tela />);
        await waitFor(() => expect(screen.getByTestId('tema').textContent).toBe('dark'));
        fireEvent.click(screen.getByRole('button', { name: 'Claro' }));
        expect((await screen.findByRole('alert')).textContent).toContain('não foi salvo na sua conta');
        expect(screen.getByTestId('tema').textContent).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
        fireEvent.click(screen.getByRole('button', { name: 'Tentar salvar tema novamente' }));
        await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
        expect(vi.mocked(fetch).mock.calls[2][1]).toMatchObject({ method: 'PUT', body: '{"tema":"light"}' });
    });
    it('descarta resposta atrasada de outra conta e restaura a preferência da nova conta', async () => {
        let responder!: (resposta: Response) => void;
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(() => new Promise<Response>((resolve) => { responder = resolve; }))
            .mockImplementation(async () => Response.json({ tema: 'system' })));
        const tela = render(<Tela />);
        sessao.user = { id: '2' };
        tela.rerender(<Tela />);
        await waitFor(() => expect(screen.getByTestId('tema').textContent).toBe('system'));
        await act(async () => responder(Response.json({ tema: 'dark' })));
        expect(screen.getByTestId('tema').textContent).toBe('system');
    });
    it('mantém escolha de visitante apenas em memória e não envia preferências sem login', async () => {
        sessao.user = null;
        vi.stubGlobal('fetch', vi.fn());
        const tela = render(<Tela />);
        fireEvent.click(screen.getByRole('button', { name: 'Escuro' }));
        expect(screen.getByTestId('tema').textContent).toBe('dark');
        expect(fetch).not.toHaveBeenCalled();
        tela.unmount(); render(<Tela />);
        expect(screen.getByTestId('tema').textContent).toBe('light');
    });
    it('oferece nova tentativa quando não consegue carregar o tema', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => Response.json({ tema: 'inválido' }))
            .mockImplementation(async () => Response.json({ tema: 'dark' })));
        render(<Tela />);
        expect((await screen.findByRole('alert')).textContent).toContain('Não foi possível carregar o tema');
        fireEvent.click(screen.getByRole('button', { name: 'Recarregar preferência de tema' }));
        await waitFor(() => expect(screen.getByTestId('tema').textContent).toBe('dark'));
    });
});

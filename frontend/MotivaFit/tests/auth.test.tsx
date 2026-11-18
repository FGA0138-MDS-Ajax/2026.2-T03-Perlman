import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, RotaAdmin, RotaProtegida, RotaPublica, RotaSuperusuario, useAuth } from '@/lib/auth-context';
import { getAccessToken, setAccessToken, apiRequest } from '@/lib/api/http-client';
import PaginaLogin from '@/pages-user/pagina-login';
import PaginaCadastro from '@/pages-user/pagina-cadastro';
import PaginaTreinos from '@/pages-user/pagina-treinos';
import AdminLayout from '@/components/admin-layout';

function token(perfil = 'USUARIO', extra = {}) {
    return `header.${btoa(JSON.stringify({ sub: 'aluno@example.com', id: 42, ativo: true, perfil,
        iss: 'motivafit', iat: Date.now() / 1000, exp: Math.floor(Date.now() / 1000) + 900, ...extra }))}.signature`;
}
const session = (perfil = 'USUARIO', extra = {}) => Response.json({ token: token(perfil, extra), expirationAt: new Date(Date.now() + 900000).toISOString() });
const error = (status: number, mensagem = 'Credenciais inválidas') => Response.json({ codigo: 'ERRO', mensagem, dataHora: new Date().toISOString() }, { status });

function Panel() {
    const { user, logout } = useAuth();
    return <><p>Conta: {user?.email}</p><button onClick={() => void logout()}>Sair</button></>;
}
function Location() { return <p data-testid="path">{useLocation().pathname}</p>; }
function mount(path = '/login', strict = false) {
    const app = <MemoryRouter initialEntries={[path]}><AuthProvider><Location /><Routes>
        <Route path="/login" element={<RotaPublica><PaginaLogin /></RotaPublica>} />
        <Route path="/cadastro" element={<RotaPublica><PaginaCadastro /></RotaPublica>} />
        <Route path="/treinos" element={<RotaProtegida><PaginaTreinos /></RotaProtegida>} />
        <Route path="/principal" element={<RotaProtegida><Panel /></RotaProtegida>} />
        <Route path="/admin" element={<RotaAdmin><AdminLayout title="Admin"><p>Painel administrativo</p></AdminLayout></RotaAdmin>} />
        <Route path="/admin/superusuario" element={<RotaSuperusuario><p>Área superusuário</p></RotaSuperusuario>} />
    </Routes></AuthProvider></MemoryRouter>;
    return render(strict ? <StrictMode>{app}</StrictMode> : app);
}
async function fillLogin() {
    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'aluno@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'SenhaCorreta123!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar na conta' }));
}
async function fillRegister(senha = 'SenhaCorreta123!') {
    fireEvent.change(await screen.findByLabelText('E-mail'), { target: { value: 'aluno@example.com' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: senha } });
    fireEvent.change(screen.getByLabelText('Confirmar senha'), { target: { value: senha } });
    fireEvent.click(screen.getByRole('button', { name: 'Criar minha conta' }));
}
beforeEach(() => {
    localStorage.clear();
    document.cookie = 'csrfToken=; Max-Age=0; Path=/';
    setAccessToken(null);
});
afterEach(async () => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setAccessToken(null);
});

describe('autenticação integrada', () => {
    it('retorna à tela de treinos após autenticar o acesso sem sessão', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session()));
        mount('/treinos');
        await screen.findByRole('button', { name: 'Entrar na conta' });
        expect(screen.getByTestId('path').textContent).toBe('/login');
        await fillLogin();
        await screen.findByText('Gerenciamento e montagem de treinos');
        expect(screen.getByTestId('path').textContent).toBe('/treinos');
    });

    it('abre treinos diretamente quando a sessão é restaurada', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session()));
        mount('/treinos');
        await screen.findByText('Gerenciamento e montagem de treinos');
        expect(screen.getByTestId('path').textContent).toBe('/treinos');
        expect(screen.queryByRole('button', { name: 'Entrar na conta' })).toBeNull();
    });

    it('ignora identidade e privilégios do armazenamento local', async () => {
        localStorage.setItem('motivafit_user', JSON.stringify({ email: 'admin@admin.com', role: 'admin' }));
        localStorage.setItem('motivafit_banco_admins', '["aluno@example.com"]');
        const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
        mount('/admin');
        await screen.findByRole('button', { name: 'Entrar na conta' });
        expect(screen.getByTestId('path').textContent).toBe('/login');
        expect(localStorage.getItem('motivafit_user')).toBeNull();
        expect(localStorage.getItem('motivafit_banco_admins')).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('mantém formulário e mostra erro ao rejeitar senha', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(error(401)));
        mount(); await fillLogin();
        expect((await screen.findByRole('alert')).textContent).toContain('Credenciais inválidas');
        expect((screen.getByLabelText('E-mail') as HTMLInputElement).value).toBe('aluno@example.com');
        expect(getAccessToken()).toBeNull();
        expect(screen.getByTestId('path').textContent).toBe('/login');
    });

    it('envia senha real, bloqueia envio duplicado e entra como usuário', async () => {
        let finish!: (value: Response) => void;
        const fetch = vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; }));
        vi.stubGlobal('fetch', fetch);
        mount(); await fillLogin();
        expect(screen.getByRole('button', { name: 'Entrando…' }).closest('fieldset')?.disabled).toBe(true);
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'aluno@example.com', senha: 'SenhaCorreta123!' });
        await act(async () => finish(session()));
        await screen.findByText('Conta: aluno@example.com');
        expect(screen.getByTestId('path').textContent).toBe('/principal');
        expect(localStorage.getItem('motivafit_user')).toBeNull();
    });

    it('cadastro usa contrato da API e encaminha ao login sem criar sessão', async () => {
        const fetch = vi.fn().mockResolvedValue(Response.json({ id: 42, email: 'aluno@example.com', perfil: 'USUARIO', ativo: true }, { status: 201 }));
        vi.stubGlobal('fetch', fetch);
        mount('/cadastro'); await fillRegister('Aa1!bc');
        await screen.findByText('Conta criada. Entre com seu e-mail e senha.');
        expect(fetch.mock.calls[0][0]).toBe('/api/auth/cadastro');
        expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'aluno@example.com', senha: 'Aa1!bc' });
        expect(getAccessToken()).toBeNull();
    });

    it('senha fraca não é enviada e e-mail duplicado mantém cadastro', async () => {
        const fetch = vi.fn().mockResolvedValue(error(409, 'E-mail já cadastrado'));
        vi.stubGlobal('fetch', fetch);
        mount('/cadastro'); await fillRegister('senhasemsimbolos');
        expect((await screen.findByRole('alert')).textContent).toContain('6 caracteres');
        expect(fetch).not.toHaveBeenCalled();
        await fillRegister();
        expect((await screen.findByRole('alert')).textContent).toContain('E-mail já cadastrado');
        expect(screen.getByTestId('path').textContent).toBe('/cadastro');
    });

    it('restaura sessão uma vez em StrictMode sem redirecionamento prematuro', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        let finish!: (response: Response) => void;
        const fetch = vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; }));
        vi.stubGlobal('fetch', fetch);
        mount('/principal', true);
        expect(screen.getByRole('status').textContent).toContain('Verificando');
        expect(screen.getByTestId('path').textContent).toBe('/principal');
        await act(async () => finish(session()));
        await screen.findByText('Conta: aluno@example.com');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['USUARIO', '/admin', '/principal'],
        ['ADMINISTRADOR', '/admin/superusuario', '/admin'],
        ['SUPERUSUARIO', '/admin/superusuario', '/admin/superusuario'],
    ])('perfil %s ao acessar %s vai para %s', async (perfil, origem, destino) => {
        document.cookie = 'csrfToken=csrf; Path=/';
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session(perfil)));
        mount(origem);
        await waitFor(() => expect(screen.getByTestId('path').textContent).toBe(destino));
        if (perfil === 'ADMINISTRADOR') expect(screen.queryByRole('link', { name: 'SuperUsuário' })).toBeNull();
        if (perfil === 'SUPERUSUARIO') await screen.findByText('Área superusuário');
    });

    it('refresh expirado retorna ao login e informa o motivo', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        const fetch = vi.fn().mockResolvedValue(error(401)); vi.stubGlobal('fetch', fetch);
        mount('/principal');
        await screen.findByRole('button', { name: 'Entrar na conta' });
        expect(screen.getByRole('alert').textContent).toContain('expirou');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('logout limpa sessão mesmo quando revogação falha', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        const fetch = vi.fn().mockResolvedValueOnce(session()).mockRejectedValueOnce(new TypeError('offline'));
        vi.stubGlobal('fetch', fetch);
        mount('/principal');
        fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));
        await screen.findByRole('button', { name: 'Entrar na conta' });
        await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('não foi possível confirmar'));
        expect(getAccessToken()).toBeNull();
        expect(fetch.mock.calls[1][0]).toBe('/api/auth/logout');
    });

    it('refresh automático atualiza perfil na interface e bloqueia rota perdida', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        const fetch = vi.fn().mockResolvedValueOnce(session('ADMINISTRADOR'))
            .mockResolvedValueOnce(error(401)).mockResolvedValueOnce(session('USUARIO'))
            .mockResolvedValueOnce(Response.json([]));
        vi.stubGlobal('fetch', fetch);
        mount('/admin'); await screen.findByText('Painel administrativo');
        await act(async () => { await apiRequest('/api/treinos'); });
        await screen.findByText('Conta: aluno@example.com');
        expect(screen.getByTestId('path').textContent).toBe('/principal');
    });

    it.each([{ ativo: false }, { exp: 1 }])('não aceita sessão inativa/expirada: %j', async (extra) => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(session('USUARIO', extra)));
        mount(); await fillLogin();
        expect((await screen.findByRole('alert')).textContent).toContain('inválida');
        expect(getAccessToken()).toBeNull();
    });
    it('renova antes da expiração e encerra ao falhar, sem loop', async () => {
        vi.useFakeTimers();
        document.cookie = 'csrfToken=csrf; Path=/';
        const fetch = vi.fn().mockResolvedValueOnce(session('USUARIO', { exp: Math.floor(Date.now() / 1000) + 60 }))
            .mockResolvedValueOnce(error(401));
        vi.stubGlobal('fetch', fetch);
        await act(async () => { mount('/principal'); });
        expect(screen.getByText('Conta: aluno@example.com')).toBeTruthy();
        await act(async () => { await vi.advanceTimersByTimeAsync(31000); });
        expect(screen.getByRole('button', { name: 'Entrar na conta' })).toBeTruthy();
        await act(async () => { await vi.advanceTimersByTimeAsync(120000); });
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(getAccessToken()).toBeNull();
    });

    it('logout bem-sucedido envia CSRF e desmonta dados privados', async () => {
        document.cookie = 'csrfToken=csrf; Path=/';
        const fetch = vi.fn().mockResolvedValueOnce(session()).mockResolvedValueOnce(new Response(null, { status: 204 }));
        vi.stubGlobal('fetch', fetch);
        mount('/principal');
        fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));
        await screen.findByRole('button', { name: 'Entrar na conta' });
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
        expect(fetch.mock.calls[1][1].headers.get('X-CSRF-TOKEN')).toBe('csrf');
        expect(screen.queryByText('Conta: aluno@example.com')).toBeNull();
        expect(getAccessToken()).toBeNull();
    });

});

import { render } from '@testing-library/react';
import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, RotaProtegida } from '@/lib/auth-context';

export const dataHora = '2026-11-20T10:00:00.000Z';

export function token(id = 42, email = 'aluno@example.com', perfil = 'USUARIO') {
    const payload = { sub: email, id, ativo: true, perfil, iss: 'motivafit',
        iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
}

export const sessao = (id = 42, email = 'aluno@example.com', perfil = 'USUARIO') =>
    Response.json({ token: token(id, email, perfil), expirationAt: new Date(Date.now() + 900000).toISOString() });

export const erro = (status: number, mensagem: string, codigo = 'ERRO') =>
    Response.json({ codigo, mensagem, dataHora }, { status });

export type Responder = (url: string, init?: RequestInit) => Promise<Response> | Response;

/** Monta uma página protegida com sessão restaurada pelo refresh simulado. */
export function montar(caminho: string, rota: string, pagina: ReactNode, responder: Responder) {
    document.cookie = 'csrfToken=csrf; Path=/';
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => Promise.resolve(responder(String(url), init))));
    return render(<MemoryRouter initialEntries={[caminho]}><AuthProvider><Routes>
        <Route path={rota} element={<RotaProtegida>{pagina}</RotaProtegida>} />
    </Routes></AuthProvider></MemoryRouter>);
}

export function chamadas(metodo?: string) {
    return vi.mocked(fetch).mock.calls.filter((chamada) => !String(chamada[0]).includes('/api/auth/')
        && (!metodo || ((chamada[1] as RequestInit | undefined)?.method ?? 'GET') === metodo));
}

export const corpo = (chamada: unknown[]) => JSON.parse(String((chamada[1] as RequestInit | undefined)?.body));

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, RotaProtegida } from '@/lib/auth-context';
import { setAccessToken } from '@/lib/api/http-client';
import PaginaTreinos from '@/pages-user/pagina-treinos';
import { formatarDataTreino } from '@/lib/treinos-apresentacao';

const criadoEm = '2026-11-05T18:30:00.000Z';
function token() {
    const payload = { sub: 'aluno@example.com', id: 42, ativo: true, perfil: 'USUARIO',
        iss: 'motivafit', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
}
const sessao = () => Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() });
const erro = (status: number, mensagem: string) => Response.json(
    { codigo: 'ERRO', mensagem, dataHora: criadoEm }, { status });
function treino(parcial: { id: number; nome: string; meuTreino: boolean; podeEditar: boolean; tipo?: string; visibilidade?: string }) {
    return { tipo: 'MUSCULACAO', visibilidade: 'PRIVADO', createdAt: criadoEm, updatedAt: criadoEm, ...parcial };
}
const meu = treino({ id: 7, nome: 'Treino A', meuTreino: true, podeEditar: true });
const alheio = treino({ id: 8, nome: 'Treino público', meuTreino: false, podeEditar: false, visibilidade: 'PUBLICO' });
const supino = { id: 1, nome: 'Supino reto', modalidade: 'MUSCULACAO', grupoMuscular: 'Peitoral' };
const corrida = { id: 2, nome: 'Corrida', modalidade: 'AEROBICO', grupoMuscular: 'Cardio' };

function mount(responder: (url: string, init?: RequestInit) => Promise<Response> | Response) {
    document.cookie = 'csrfToken=csrf; Path=/';
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => Promise.resolve(responder(String(url), init))));
    return render(<MemoryRouter initialEntries={['/treinos']}><AuthProvider><Routes>
        <Route path="/treinos" element={<RotaProtegida><PaginaTreinos /></RotaProtegida>} />
    </Routes></AuthProvider></MemoryRouter>);
}
function chamadas(metodo?: string) {
    return vi.mocked(fetch).mock.calls.filter((chamada) => !String(chamada[0]).includes('/api/auth/')
        && (!metodo || ((chamada[1] as RequestInit | undefined)?.method ?? 'GET') === metodo));
}

beforeEach(() => { localStorage.clear(); setAccessToken(null); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('catálogo e treinos', () => {
    it('separa treino próprio de público e formata a data do servidor', async () => {
        localStorage.setItem('@motivafit:treinos', '[{"id":"local"}]');
        localStorage.setItem('@motivafit:meus-exercicios', '[{"id":"usr"}]');
        mount((url) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url.includes('/api/catalogo-exercicios')) return Response.json([supino, corrida]);
            if (url.includes('/exercicios')) return Response.json([{ id: 21, meta: '3x12', metaRecorde: null, treinoId: meu.id, catalogoExercicioId: supino.id }]);
            return Response.json([meu, alheio]);
        });
        expect(await screen.findByRole('heading', { name: 'Treino A' })).toBeTruthy();
        const meus = screen.getByRole('heading', { name: 'Meus treinos' }).parentElement!;
        const publicos = screen.getByRole('heading', { name: 'Treinos públicos de outras pessoas' }).parentElement!;
        expect(within(meus).getByRole('button', { name: 'Editar' })).toBeTruthy();
        expect(within(meus).getByRole('link', { name: 'Realizar treino' }).getAttribute('href')).toBe('/treinos/7/realizar');
        expect(within(publicos).queryByRole('link', { name: 'Realizar treino' })).toBeNull();
        expect(await within(meus).findByText('Supino reto — 3x12')).toBeTruthy();
        expect(within(publicos).getByRole('heading', { name: 'Treino público' })).toBeTruthy();
        expect(within(publicos).queryByRole('button', { name: 'Editar' })).toBeNull();
        expect(within(publicos).getByText(/não alterá-lo/)).toBeTruthy();
        expect(document.body.textContent).toContain(formatarDataTreino(criadoEm));
        expect(screen.getByText('Supino reto')).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Novo Exercício/ })).toBeNull();
        expect(localStorage.getItem('@motivafit:treinos')).toBeNull();
        expect(localStorage.getItem('@motivafit:meus-exercicios')).toBeNull();
        expect(chamadas().some((chamada) => String(chamada[0]).includes('/api/admin/'))).toBe(false);
    });

    it('filtra o catálogo e oferece nova tentativa quando a consulta falha', async () => {
        let falhas = 0;
        mount((url) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url.includes('/api/catalogo-exercicios')) {
                falhas += 1;
                return falhas === 1 ? erro(503, 'Catálogo indisponível') : Response.json([supino, corrida]);
            }
            return Response.json([]);
        });
        expect((await screen.findByRole('alert')).textContent).toContain('Catálogo indisponível');
        fireEvent.click(screen.getByRole('button', { name: 'Tentar carregar o catálogo novamente' }));
        expect(await screen.findByText('Supino reto')).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Buscar no catálogo'), { target: { value: 'corrida' } });
        expect(screen.queryByText('Supino reto')).toBeNull();
        expect(screen.getByText('Corrida')).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Buscar no catálogo'), { target: { value: '' } });
        fireEvent.change(screen.getByLabelText('Modalidade do catálogo'), { target: { value: 'AEROBICO' } });
        expect(screen.queryByText('Supino reto')).toBeNull();
        expect(screen.getByText('Corrida')).toBeTruthy();
        fireEvent.change(screen.getByLabelText('Grupo muscular'), { target: { value: 'Peitoral' } });
        expect(screen.getByText('Nenhum exercício encontrado na busca.')).toBeTruthy();
    });

    it('cria e edita somente depois do sucesso e mantém o formulário na falha', async () => {
        const lista = [meu];
        mount((url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url.includes('/api/catalogo-exercicios')) return Response.json([]);
            const metodo = init?.method ?? 'GET';
            if (metodo === 'POST') return erro(400, 'Nome inválido');
            if (metodo === 'PUT') {
                return Response.json(treino({ id: 7, nome: 'Treino ajustado', meuTreino: true, podeEditar: true, tipo: 'AEROBICO', visibilidade: 'PUBLICO' }));
            }
            return Response.json(lista);
        });
        await screen.findByRole('heading', { name: 'Treino A' });
        fireEvent.click(screen.getByRole('button', { name: 'Criar treino' }));
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Informe o nome');
        expect(chamadas('POST')).toHaveLength(0);
        fireEvent.change(screen.getByLabelText('Nome do treino'), { target: { value: '  Corrida leve  ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Aeróbico' }));
        fireEvent.click(screen.getByRole('button', { name: 'Público' }));
        const salvar = screen.getByRole('button', { name: 'Salvar treino' });
        fireEvent.click(salvar);
        fireEvent.click(salvar);
        expect((await screen.findByRole('alert')).textContent).toContain('Nome inválido');
        expect(screen.getByLabelText('Nome do treino')).toBeTruthy();
        expect(chamadas('POST')).toHaveLength(1);
        expect(JSON.parse(String(chamadas('POST')[0][1]?.body))).toEqual({
            nome: 'Corrida leve', tipo: 'AEROBICO', visibilidade: 'PUBLICO',
        });
        expect(screen.getByRole('heading', { name: 'Treino A' })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
        fireEvent.change(screen.getByLabelText('Nome do treino'), { target: { value: 'Treino ajustado' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect(await screen.findByRole('heading', { name: 'Treino ajustado' })).toBeTruthy();
        expect(chamadas('PUT')[0][0]).toBe('/api/treinos/7');
    });

    it('cria o treino e só depois associa os exercícios escolhidos', async () => {
        const criados: unknown[] = [];
        mount((url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url.includes('/api/catalogo-exercicios')) return Response.json([supino, corrida]);
            if (url.includes('/exercicios')) {
                if (init?.method === 'POST') {
                    criados.push(JSON.parse(String(init.body)));
                    if (criados.length === 1) return erro(500, 'Falha ao associar');
                    return Response.json({ id: 30, meta: '5 km', metaRecorde: null, treinoId: 9, catalogoExercicioId: corrida.id });
                }
                return Response.json([{ id: 21, meta: '3x12', metaRecorde: '50kg', treinoId: 7, catalogoExercicioId: supino.id }]);
            }
            if (init?.method === 'POST') return Response.json(treino({ id: 9, nome: 'Corrida leve', meuTreino: true, podeEditar: true, tipo: 'AEROBICO', visibilidade: 'PRIVADO' }), { status: 201 });
            if (init?.method === 'PUT') return Response.json(treino({ id: 9, nome: 'Corrida leve', meuTreino: true, podeEditar: true, tipo: 'AEROBICO', visibilidade: 'PRIVADO' }));
            return Response.json([meu]);
        });
        await screen.findByRole('heading', { name: 'Treino A' });
        fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
        expect(await screen.findByText('Meta: 3x12. Recorde: 50kg')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
        fireEvent.click(screen.getByRole('button', { name: 'Criar treino' }));
        fireEvent.change(screen.getByLabelText('Nome do treino'), { target: { value: 'Corrida leve' } });
        fireEvent.click(screen.getByRole('button', { name: 'Adicionar Corrida' }));
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Informe a meta de Corrida');
        expect(chamadas('POST')).toHaveLength(0);

        fireEvent.change(screen.getByLabelText('Meta de Corrida'), { target: { value: '5 km' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect((await screen.findByRole('alert')).textContent).toContain('O treino foi salvo, mas não foi possível incluir Corrida');
        expect(chamadas('POST').map((chamada) => String(chamada[0]))).toEqual(['/api/treinos', '/api/treinos/9/exercicios']);

        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        await waitFor(() => expect(screen.queryByLabelText('Nome do treino')).toBeNull());
        expect(chamadas('POST').filter((chamada) => String(chamada[0]) === '/api/treinos')).toHaveLength(1);
        expect(chamadas('POST').filter((chamada) => String(chamada[0]).includes('/exercicios'))).toHaveLength(2);
        expect(chamadas('PUT')).toHaveLength(1);
        expect(criados[1]).toEqual({ meta: '5 km', metaRecorde: null, treinoId: 9, catalogoExercicioId: corrida.id });
    });

    it('só retira o treino da lista depois da exclusão confirmada', async () => {
        let excluirFalhou = true;
        mount((url, init) => {
            if (url.includes('/api/auth/refresh')) return sessao();
            if (url.includes('/api/catalogo-exercicios')) return Response.json([]);
            if (init?.method === 'DELETE') {
                if (excluirFalhou) { excluirFalhou = false; return erro(500, 'Falha ao excluir'); }
                return new Response(null, { status: 204 });
            }
            return Response.json([meu]);
        });
        await screen.findByRole('heading', { name: 'Treino A' });
        fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Falha ao excluir');
        expect(screen.getByRole('heading', { name: 'Treino A' })).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
        expect(await screen.findByText('Nenhum treino criado.')).toBeTruthy();
        expect(screen.queryByRole('heading', { name: 'Treino A' })).toBeNull();
        expect(chamadas('DELETE')).toHaveLength(2);
    });

    it('mostra erro recuperável em vez de lista vazia quando a resposta é inválida', async () => {
        mount((url) => url.includes('/api/auth/refresh') ? sessao()
            : url.includes('/api/catalogo-exercicios') ? Response.json([]) : Response.json({ token: 'nao-e-lista' }));
        expect((await screen.findByRole('alert')).textContent).toContain('resposta inválida');
        expect(screen.queryByText('Nenhum treino criado.')).toBeNull();
        expect(screen.getByRole('button', { name: 'Tentar carregar treinos novamente' })).toBeTruthy();
    });
});

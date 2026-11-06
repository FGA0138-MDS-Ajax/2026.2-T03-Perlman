import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, RotaProtegida } from '@/lib/auth-context';
import { setAccessToken } from '@/lib/api/http-client';
import PaginaRealizarTreino from '@/pages-user/pagina-realizar-treino';

function token() {
    const payload = { sub: 'aluno@example.com', id: 42, ativo: true, perfil: 'USUARIO',
        iss: 'motivafit', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
}
const sessao = () => Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() });
const treino = { id: 7, nome: 'Treino A', tipo: 'MUSCULACAO', visibilidade: 'PRIVADO', createdAt: '2026-11-05T18:30:00.000Z', updatedAt: '2026-11-05T18:30:00.000Z', meuTreino: true, podeEditar: true };
const supino = { id: 1, nome: 'Supino reto', modalidade: 'MUSCULACAO', grupoMuscular: 'Peitoral' };
const exercicio = { id: 21, meta: '3x12', metaRecorde: null, treinoId: 7, catalogoExercicioId: 1 };

function mount(tipo: string, modalidade: string, registrar?: (body: unknown) => Response) {
    document.cookie = 'csrfToken=csrf; Path=/';
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
        const endereco = String(url);
        if (endereco.includes('/api/auth/refresh')) return Promise.resolve(sessao());
        if (endereco.includes('/api/catalogo-exercicios')) return Promise.resolve(Response.json([{ ...supino, modalidade }]));
        if (endereco.includes('/exercicios')) return Promise.resolve(Response.json([exercicio]));
        if (endereco.includes('/api/registros')) return Promise.resolve(registrar ? registrar(JSON.parse(String(init?.body))) : Response.json({ id: 9, catalogoId: 1, exercicioNome: 'Supino reto', tempoS: 90 }));
        if (endereco.includes('/api/treinos/7')) return Promise.resolve(Response.json({ ...treino, tipo }));
        return Promise.resolve(Response.json({ codigo: 'ERRO', mensagem: 'não mapeado', dataHora: '2026-11-05T18:30:00Z' }, { status: 500 }));
    }));
    return render(<MemoryRouter initialEntries={['/treinos/7/realizar']}><AuthProvider><Routes>
        <Route path="/treinos/:treinoId/realizar" element={<RotaProtegida><PaginaRealizarTreino /></RotaProtegida>} />
    </Routes></AuthProvider></MemoryRouter>);
}

beforeEach(() => { localStorage.clear(); setAccessToken(null); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('realizar treino', () => {
    it('mostra séries, repetições e carga para musculação e envia o que foi realizado', async () => {
        const corpos: unknown[] = [];
        mount('MUSCULACAO', 'MUSCULACAO', (body) => { corpos.push(body); return Response.json({ id: 9, catalogoId: 1, exercicioNome: 'Supino reto', tempoS: 90 }); });
        expect(await screen.findByRole('heading', { name: 'Treino A' })).toBeTruthy();
        expect(screen.getByText('Meta: 3x12')).toBeTruthy();
        expect(screen.getByLabelText('Séries de Supino reto')).toBeTruthy();
        expect(screen.getByLabelText('Repetições de Supino reto')).toBeTruthy();
        expect(screen.getByLabelText('Carga de Supino reto (kg)')).toBeTruthy();
        expect(screen.queryByLabelText('Distância de Supino reto (m)')).toBeNull();
        expect(screen.getAllByRole('button', { name: 'Salvar treino' })).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect((await screen.findByRole('alert')).textContent).toContain('Informe o tempo em minutos');
        fireEvent.change(screen.getByLabelText('Séries de Supino reto'), { target: { value: '4' } });
        fireEvent.change(screen.getByLabelText('Repetições de Supino reto'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Carga de Supino reto (kg)'), { target: { value: '20,5' } });
        fireEvent.change(screen.getByLabelText('Tempo de Supino reto (minutos)'), { target: { value: '1,5' } });
        fireEvent.click(screen.getByRole('button', { name: 'Salvar treino' }));
        expect(await screen.findByText('Execução registrada.')).toBeTruthy();
        expect(corpos[0]).toMatchObject({ catalogoId: 1, treinoId: 7, exercicioId: 21, series: 4, repeticoes: 10, cargaKg: 20.5, tempoS: 90 });
        expect(corpos[0]).not.toHaveProperty('distanciaM');
    });

    it('mostra tempo e distância para treino aeróbico', async () => {
        mount('AEROBICO', 'AEROBICO');
        expect(await screen.findByLabelText('Distância de Supino reto (m)')).toBeTruthy();
        expect(screen.getByLabelText('Tempo de Supino reto (minutos)')).toBeTruthy();
        expect(screen.queryByLabelText('Séries de Supino reto')).toBeNull();
        expect(screen.queryByLabelText('Repetições de Supino reto')).toBeNull();
        expect(screen.queryByLabelText('Carga de Supino reto (kg)')).toBeNull();
    });
});

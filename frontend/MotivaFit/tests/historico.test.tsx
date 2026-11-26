import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { setAccessToken } from '@/lib/api/http-client';
import PaginaHistorico from '@/pages-user/pagina-historico';

function token() {
    const payload = {
        sub: 'aluno@example.com', id: 42, ativo: true, perfil: 'USUARIO',
        iss: 'motivafit', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900,
    };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
}

function execucao(id: number, nome: string, quando: string, treinoNome: string | null = 'Peito antigo') {
    return {
        id, catalogoId: 1, treinoId: 7, exercicioId: id, treinoNome, exercicioNome: nome,
        cargaKg: 20.5, repeticoes: 10, series: 4, tempoS: 90, distanciaM: null, executadoEm: quando,
    };
}

const agora = new Date('2026-11-06T15:00:00.000Z');
const registros = [
    execucao(1, 'Supino histórico', '2026-11-06T02:30:00.000Z'),
    execucao(2, 'Remada de hoje', '2026-11-06T15:00:00.000Z'),
    execucao(3, 'Agachamento de segunda', '2026-11-02T03:00:00.000Z'),
    execucao(4, 'Corrida de outubro', '2026-11-01T02:30:00.000Z', null),
];

function mount(lista: unknown[] | null, falhaInicial = false) {
    document.cookie = 'csrfToken=csrf; Path=/';
    const consulta = { falhou: falhaInicial };
    vi.stubGlobal('fetch', vi.fn((url: string) => {
        const endereco = String(url);
        if (endereco.includes('/api/auth/refresh')) {
            return Promise.resolve(Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() }));
        }
        if (endereco.includes('/api/registros')) {
            if (consulta.falhou) {
                return Promise.resolve(Response.json({ codigo: 'ERRO', mensagem: 'indisponível', dataHora: '2026-11-06T15:00:00Z' }, { status: 500 }));
            }
            return Promise.resolve(Response.json(lista ?? []));
        }
        return Promise.resolve(Response.json({ codigo: 'ERRO', mensagem: 'não mapeado', dataHora: '2026-11-06T15:00:00Z' }, { status: 500 }));
    }));
    render(
        <MemoryRouter initialEntries={['/historico']}>
            <AuthProvider><PaginaHistorico /></AuthProvider>
        </MemoryRouter>,
    );
    return consulta;
}

beforeEach(() => {
    localStorage.clear();
    setAccessToken(null);
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(agora);
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setAccessToken(null);
});

describe('histórico de exercícios', () => {
    it('lista todas as execuções e marca a página no menu', async () => {
        mount(registros);
        expect(await screen.findByText('Supino histórico')).toBeTruthy();
        expect(screen.getByText('Remada de hoje')).toBeTruthy();
        expect(screen.getByText('Agachamento de segunda')).toBeTruthy();
        expect(screen.getByText('Corrida de outubro')).toBeTruthy();
        expect(screen.getByText(/Sem treino vinculado/)).toBeTruthy();
        expect(screen.getAllByText('4 séries · 10 repetições · 20.5 kg · 90 s').length).toBe(4);
        expect(screen.getByText('4 execuções')).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Semana anterior' })).toBeNull();
        const menu = screen.getByRole('navigation', { name: 'Menu principal' });
        expect(menu.querySelector('[aria-current="page"]')?.textContent).toBe('Histórico');
        expect(screen.getByRole('button', { name: 'Lista', pressed: true })).toBeTruthy();
    });

    it('pagina a semana civil de Brasília e não avança além da semana atual', async () => {
        mount(registros);
        expect(await screen.findByText('Remada de hoje')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Semana' }));
        expect(screen.getByRole('heading', { name: '2 a 8 de novembro de 2026' })).toBeTruthy();
        expect(screen.getByText('Remada de hoje')).toBeTruthy();
        expect(screen.getByText('Supino histórico')).toBeTruthy();
        expect(screen.getByRole('region', { name: 'Quinta-feira, 5 de novembro' })).toBeTruthy();
        expect(screen.queryByText('Corrida de outubro')).toBeNull();
        expect(screen.getByRole('button', { name: 'Próxima semana' }).hasAttribute('disabled')).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Semana anterior' }));
        expect(screen.getByRole('heading', { name: '26 de outubro de 2026 a 1 de novembro de 2026' })).toBeTruthy();
        expect(screen.getByText('Corrida de outubro')).toBeTruthy();
        expect(screen.queryByText('Remada de hoje')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Próxima semana' }));
        expect(screen.getByRole('heading', { name: '2 a 8 de novembro de 2026' })).toBeTruthy();
        expect(screen.getByText('Agachamento de segunda')).toBeTruthy();
    });

    it('pagina o mês civil e isola o dia anterior à meia-noite de Brasília', async () => {
        mount(registros);
        expect(await screen.findByText('Remada de hoje')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Mês' }));
        expect(screen.getByRole('heading', { name: 'Novembro de 2026' })).toBeTruthy();
        expect(screen.getByText('3 execuções')).toBeTruthy();
        expect(screen.queryByText('Corrida de outubro')).toBeNull();
        expect(screen.getByRole('button', { name: 'Próximo mês' }).hasAttribute('disabled')).toBe(true);

        fireEvent.click(screen.getByRole('button', { name: 'Mês anterior' }));
        expect(screen.getByRole('heading', { name: 'Outubro de 2026' })).toBeTruthy();
        expect(screen.getByText('Corrida de outubro')).toBeTruthy();
        expect(screen.getByText('1 execução')).toBeTruthy();
        expect(screen.queryByText('Supino histórico')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Próximo mês' }));
        expect(screen.getByText('Remada de hoje')).toBeTruthy();
    });

    it('mostra o período vazio e permite repetir depois de uma falha', async () => {
        mount([]);
        expect(await screen.findByText('Nenhuma execução registrada nesta conta.')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Semana' }));
        expect(screen.getByText('Nenhuma execução na semana de 2 a 8 de novembro de 2026.')).toBeTruthy();
        cleanup();
        const controle = mount(null, true);
        expect((await screen.findAllByRole('alert')).some((item) => item.textContent?.includes('indisponível'))).toBe(true);
        controle.falhou = false;
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhuma execução registrada nesta conta.')).toBeTruthy();
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth-context';
import { setAccessToken } from '@/lib/api/http-client';
import { TAMANHO_PAGINA_HISTORICO } from '@/lib/api/registros-api';
import { resumirExecucoes } from '@/lib/indicadores-execucao';
import PaginaPrincipal from '@/pages-user/pagina-principal';

function token() {
    const payload = { sub: 'aluno@example.com', id: 42, ativo: true, perfil: 'USUARIO',
        iss: 'motivafit', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 };
    return `header.${btoa(JSON.stringify(payload))}.signature`;
}

function execucao(id: number, nome: string, quando: string, treinoNome: string | null = 'Peito antigo') {
    return {
        id, catalogoId: 1, treinoId: 7, exercicioId: id, treinoNome, exercicioNome: nome,
        cargaKg: 20.5, repeticoes: 10, series: 4, tempoS: 90, distanciaM: null, executadoEm: quando,
    };
}

const agora = new Date('2026-11-06T15:00:00.000Z');
const completas = [
    execucao(1, 'Supino histórico', '2026-11-06T02:30:00.000Z'),
    execucao(2, 'Remada de hoje', '2026-11-06T15:00:00.000Z'),
    execucao(3, 'Agachamento de segunda', '2026-11-02T03:00:00.000Z'),
    execucao(4, 'Corrida da semana passada', '2026-11-01T02:30:00.000Z', null),
];
const paginaInicial = Array.from({ length: TAMANHO_PAGINA_HISTORICO }, (_, indice) => (
    indice === 0 ? completas[0] : execucao(100 + indice, `Exercício ${indice}`, '2026-11-04T15:00:00.000Z', 'Treino da página')
));
const paginaSeguinte = [execucao(900, 'Remada final', '2026-11-03T15:00:00.000Z', 'Costas arquivado')];

function mount(registros: (url: URL) => unknown[]) {
    document.cookie = 'csrfToken=csrf; Path=/';
    vi.stubGlobal('fetch', vi.fn((url: string) => {
        const endereco = String(url);
        if (endereco.includes('/api/auth/refresh')) {
            return Promise.resolve(Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() }));
        }
        if (endereco.includes('/api/registros')) return Promise.resolve(Response.json(registros(new URL(endereco, 'http://localhost'))));
        return Promise.resolve(Response.json({ codigo: 'ERRO', mensagem: 'não mapeado', dataHora: '2026-11-06T15:00:00Z' }, { status: 500 }));
    }));
    return render(<MemoryRouter><AuthProvider><PaginaPrincipal /></AuthProvider></MemoryRouter>);
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

describe('painel do aluno', () => {
    it('mostra execuções da conta, preserva o nome histórico e não conclui uma sessão', async () => {
        mount((url) => {
            const tamanho = Number(url.searchParams.get('tamanho'));
            const pagina = Number(url.searchParams.get('pagina'));
            if (tamanho === 100) return completas;
            return pagina === 0 ? paginaInicial : paginaSeguinte;
        });

        expect(await screen.findByText('Supino histórico')).toBeTruthy();
        expect(screen.getByText(/Peito antigo/)).toBeTruthy();
        expect(screen.getAllByText('4 séries · 10 repetições · 20.5 kg · 90 s').length).toBeGreaterThan(0);
        expect(screen.queryByText('Concluído')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Registrar treino concluído' })).toBeNull();
        const resumo = resumirExecucoes(completas, agora);
        await waitFor(() => {
            const cartaoSemana = screen.getByText('Execuções na semana').closest('.shadow-sm');
            const cartaoSequencia = screen.getByText('Sequência Ativa').closest('.shadow-sm');
            expect(cartaoSemana?.querySelector('.text-3xl')?.textContent).toBe(String(resumo.execucoesNaSemana));
            expect(cartaoSequencia?.querySelector('.text-3xl')?.textContent).toBe(`${resumo.sequenciaDias} dias`);
        });

        fireEvent.click(screen.getByRole('button', { name: 'Carregar mais' }));
        expect(await screen.findByText('Remada final')).toBeTruthy();
        expect(screen.getByText(/Costas arquivado/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Carregar mais' })).toBeNull();
    });

    it('permite repetir quando o histórico falha', async () => {
        let falhou = true;
        document.cookie = 'csrfToken=csrf; Path=/';
        vi.stubGlobal('fetch', vi.fn((url: string) => {
            const endereco = String(url);
            if (endereco.includes('/api/auth/refresh')) {
                return Promise.resolve(Response.json({ token: token(), expirationAt: new Date(Date.now() + 900000).toISOString() }));
            }
            if (falhou) {
                return Promise.resolve(Response.json({ codigo: 'ERRO', mensagem: 'indisponível', dataHora: '2026-11-06T15:00:00Z' }, { status: 500 }));
            }
            return Promise.resolve(Response.json([]));
        }));
        render(<MemoryRouter><AuthProvider><PaginaPrincipal /></AuthProvider></MemoryRouter>);

        expect((await screen.findAllByRole('alert')).some((item) => item.textContent?.includes('indisponível'))).toBe(true);
        falhou = false;
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Nenhuma execução registrada nesta conta.')).toBeTruthy();
    });
});

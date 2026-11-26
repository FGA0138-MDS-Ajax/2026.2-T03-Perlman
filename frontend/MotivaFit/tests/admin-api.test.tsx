import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaDashboardAdmin from '@/pages-admin/pagina-dashboard-admin';
import PaginaRelatoriosAdmin, { linhasRelatorio } from '@/pages-admin/pagina-relatorios-admin';
import PaginaTreinosAdmin from '@/pages-admin/pagina-treinos-admin';
import { setAccessToken } from '@/lib/api/http-client';
import type { RelatorioAdmin } from '@/lib/api/admin-api';

vi.mock('@/lib/auth-context', async (importOriginal) => ({
    ...await importOriginal<typeof import('@/lib/auth-context')>(),
    useAuth: () => ({ user: { id: '1', email: 'admin@example.com', nome: 'Admin' }, isSuperusuario: false, logout: vi.fn(), enviando: false }),
}));

const ativos = { de: '2026-10-25', ate: '2026-11-23', totalContas: 20, ativosNoPeriodo: 4, percentualAtivos: 20, serie: [] };
const rotinas = { de: '2026-10-25', ate: '2026-11-23', treinosAtivos: 12, porTipo: [{ tipo: 'MUSCULACAO', treinos: 9 }, { tipo: 'AEROBICO', treinos: 3 }],
    percentualTreinosPublicos: 25, percentualRegistrosComTreino: 80,
    treinosPublicosMaisAdicionados: [{ posicao: 1, treinoId: 3, nome: 'Full body', adicoes: 6, usuariosDistintos: 5 }] };
const exercicios = { de: '2026-10-25', ate: '2026-11-23', suprimidos: 2,
    ranking: [{ posicao: 1, catalogoId: 1, nome: 'Supino reto', modalidade: 'MUSCULACAO', grupoMuscular: 'Peito', execucoes: 90, usuariosDistintos: 7 }] };
const erro = () => Response.json({ codigo: 'ERRO', mensagem: 'Serviço indisponível', dataHora: '2026-11-11T12:00:00Z' }, { status: 503 });

function responder(url: string) {
    if (url.includes('/usuarios-ativos')) return Response.json(ativos);
    if (url.includes('/rotinas')) return Response.json(rotinas);
    if (url.includes('/exercicios-mais-realizados')) return Response.json(exercicios);
    return Response.json({}, { status: 404 });
}
// Nenhuma tela administrativa deve consultar contas, e-mails ou treinos individuais.
function semDadosIndividuais() {
    const urls = vi.mocked(fetch).mock.calls.map(([url]) => String(url));
    expect(urls.every((url) => url.startsWith('/api/admin/metricas/'))).toBe(true);
    // O único e-mail exibido é o do administrador logado, no cabeçalho do layout.
    expect(screen.getAllByText(/@/).every((elemento) => elemento.textContent === 'admin@example.com')).toBe(true);
    expect(screen.queryAllByRole('cell').some((celula) => celula.textContent?.includes('@'))).toBe(false);
}

beforeEach(() => { setAccessToken('teste'); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); setAccessToken(null); });

describe('administração com métricas gerais', () => {
    it('mostra totais no dashboard sem consultar dados do navegador nem contas', async () => {
        const leitura = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('storage proibido'); });
        vi.stubGlobal('fetch', vi.fn(async (url: string) => responder(String(url))));
        render(<MemoryRouter><PaginaDashboardAdmin /></MemoryRouter>);
        expect(screen.getByRole('status')).toBeTruthy();
        expect(await screen.findByText('90')).toBeTruthy();
        expect(screen.getByText('12')).toBeTruthy();
        expect(screen.getByText('20')).toBeTruthy();
        expect(leitura).not.toHaveBeenCalled();
        semDadosIndividuais();
    });

    it('relatório mostra só indicadores agregados e permite atualizar', async () => {
        vi.stubGlobal('fetch', vi.fn(async (url: string) => responder(String(url))));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect(await screen.findByText('Supino reto')).toBeTruthy();
        expect(screen.getByText('80%')).toBeTruthy();
        expect(screen.getByText(/2 exercício\(s\) omitido\(s\)/)).toBeTruthy();
        expect(screen.queryByRole('button', { name: 'Próxima' })).toBeNull();
        expect(screen.queryByText('Exportar contas')).toBeNull();
        semDadosIndividuais();
        fireEvent.click(screen.getByRole('button', { name: 'Atualizar dados' }));
        await waitFor(() => expect(vi.mocked(fetch).mock.calls.length).toBeGreaterThan(3));
    });

    it('exporta apenas métricas agregadas', () => {
        const linhas = linhasRelatorio({ resumo: { totalUsuarios: 20, usuariosAtivos: 4, percentualAtivos: 20, treinosAtivos: 12, execucoesTopExercicios: 90 },
            exercicios, rotinas } as RelatorioAdmin);
        expect(linhas[0]).toEqual(['indicador', 'valor']);
        expect(linhas).toContainEqual(['Treinos de Musculação', 9]);
        expect(linhas).toContainEqual(['Execuções de Supino reto', 90]);
        expect(JSON.stringify(linhas)).not.toMatch(/@/);
    });

    it('não converte erro da API em zero e permite nova tentativa', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementationOnce(async () => erro())
            .mockImplementation(async (url: string) => responder(String(url))));
        render(<MemoryRouter><PaginaRelatoriosAdmin /></MemoryRouter>);
        expect((await screen.findByRole('alert')).textContent).toContain('Serviço indisponível');
        expect(screen.queryByText('0')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
        expect(await screen.findByText('Supino reto')).toBeTruthy();
    });

    it('treinos mostram totais e públicos mais adicionados, sem treinos individuais', async () => {
        vi.stubGlobal('fetch', vi.fn(async (url: string) => responder(String(url))));
        render(<MemoryRouter><PaginaTreinosAdmin /></MemoryRouter>);
        expect(await screen.findByText('Full body')).toBeTruthy();
        expect(screen.getByText('Treinos de Musculação')).toBeTruthy();
        expect(screen.getByText('25%')).toBeTruthy();
        semDadosIndividuais();
    });
});

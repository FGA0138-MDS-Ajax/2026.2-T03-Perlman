import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { apiRequest, getAccessToken, setAccessToken, refreshSession, readCsrfCookie } from '../src/lib/api/http-client.ts';

const originalFetch = globalThis.fetch;
const json = (body, status = 200) => Response.json(body, { status });
const unauthorized = () => json({ codigo: 'AUTENTICACAO_NECESSARIA', mensagem: 'Entre novamente', dataHora: '2026-11-05' }, 401);
const renewed = () => json({ token: 'new', expirationAt: '2026-11-05T15:00:00Z' });
function deferred() {
    let resolve;
    const promise = new Promise((done) => { resolve = done; });
    return { promise, resolve };
}

beforeEach(() => {
    globalThis.document = { cookie: 'theme=light; csrfToken=csrf-value' };
    setAccessToken('old');
});
afterEach(() => {
    globalThis.fetch = originalFetch;
    delete globalThis.document;
    setAccessToken(null);
});

test('401 simultâneos e atrasados compartilham uma única rotação', async () => {
    const gate = deferred();
    let refreshes = 0;
    let requests = 0;
    globalThis.fetch = async (url, init) => {
        assert.equal(init.credentials, 'include');
        if (url.endsWith('/refresh')) {
            refreshes++;
            assert.equal(init.headers.get('X-CSRF-TOKEN'), 'csrf-value');
            await gate.promise;
            return renewed();
        }
        requests++;
        if (init.headers.get('Authorization') === 'Bearer old') return unauthorized();
        assert.equal(init.headers.get('Authorization'), 'Bearer new');
        return json(['treino']);
    };
    const first = apiRequest('/api/treinos');
    const second = apiRequest('/api/treinos');
    await new Promise(setImmediate);
    gate.resolve();
    assert.deepEqual(await Promise.all([first, second]), [['treino'], ['treino']]);
    assert.equal(refreshes, 1);
    assert.equal(requests, 4);
});

test('401 recebido depois da rotação reutiliza o token novo', async () => {
    const late = deferred();
    let refreshes = 0;
    globalThis.fetch = async (url, init) => {
        if (url.endsWith('/refresh')) { refreshes++; return renewed(); }
        if (init.headers.get('Authorization') === 'Bearer new') return json([]);
        if (url.endsWith('/late')) await late.promise;
        return unauthorized();
    };
    const delayed = apiRequest('/api/late');
    await apiRequest('/api/treinos');
    late.resolve();
    await delayed;
    assert.equal(refreshes, 1);
});

test('segundo 401 encerra sessão sem loop', async () => {
    let calls = 0;
    globalThis.fetch = async (url) => { calls++; return url.endsWith('/refresh') ? renewed() : unauthorized(); };
    await assert.rejects(apiRequest('/api/treinos'), { status: 401 });
    assert.equal(calls, 3);
    assert.equal(getAccessToken(), null);
});

test('login inválido não tenta refresh, mesmo sem authenticated:false', async () => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return unauthorized(); };
    await assert.rejects(apiRequest('/api/auth/login', { method: 'POST' }), { status: 401 });
    assert.equal(calls, 1);
});

test('falha de rede em mutação não repete a escrita e preserva causa', async () => {
    let calls = 0;
    const cause = new TypeError('network');
    globalThis.fetch = async () => { calls++; throw cause; };
    await assert.rejects(apiRequest('/api/treinos', { method: 'POST', body: { nome: 'A' } }),
        (error) => error.code === 'REDE_INDISPONIVEL' && error.cause === cause);
    assert.equal(calls, 1);
});

test('refresh rejeitado limpa token e não repete requisição original', async () => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return unauthorized(); };
    await assert.rejects(apiRequest('/api/treinos'), { status: 401 });
    assert.equal(calls, 2);
    assert.equal(getAccessToken(), null);
});

test('logout durante refresh impede restauração da sessão', async () => {
    const gate = deferred();
    globalThis.fetch = async () => { await gate.promise; return renewed(); };
    const pending = refreshSession();
    setAccessToken(null);
    gate.resolve();
    await assert.rejects(pending, { code: 'SESSAO_ALTERADA' });
    assert.equal(getAccessToken(), null);
});

test('resposta da conta anterior é descartada após troca de sessão', async () => {
    const gate = deferred();
    globalThis.fetch = async () => { await gate.promise; return json(['dados privados']); };
    const pending = apiRequest('/api/treinos');
    setAccessToken('outra-conta');
    gate.resolve();
    await assert.rejects(pending, { code: 'SESSAO_ALTERADA' });
});

test('corpo inválido vira erro normalizado e 204 não tenta ler JSON', async () => {
    for (const status of [200, 500]) {
        globalThis.fetch = async () => new Response('<html>erro</html>', { status });
        await assert.rejects(apiRequest('/api/treinos'), { code: 'RESPOSTA_API_INVALIDA', status });
    }
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await apiRequest('/api/treinos/1', { method: 'DELETE' }), undefined);
});

test('erros de negócio preservam código, mensagem e status', async () => {
    for (const status of [400, 403, 404, 409, 500]) {
        globalThis.fetch = async () => json({ codigo: 'ERRO', mensagem: 'Mensagem pública', dataHora: 'hoje' }, status);
        await assert.rejects(apiRequest('/api/treinos'), { code: 'ERRO', status, message: 'Mensagem pública' });
    }
});

test('cancelamento não renova sessão nem vira erro de rede', async () => {
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async () => { throw controller.signal.reason; };
    await assert.rejects(apiRequest('/api/treinos', { signal: controller.signal }), { name: 'AbortError' });
});

test('cookie CSRF ausente ou malformado tem erro identificado', () => {
    document.cookie = '';
    assert.throws(readCsrfCookie, { code: 'CSRF_AUSENTE' });
    document.cookie = 'csrfToken=%';
    assert.throws(readCsrfCookie, { code: 'CSRF_INVALIDO' });
});


test('consulta após logout não restaura sessão implicitamente', async () => {
    setAccessToken(null);
    let calls = 0;
    globalThis.fetch = async () => { calls++; return unauthorized(); };
    await assert.rejects(apiRequest('/api/treinos'), { status: 401 });
    assert.equal(calls, 1);
    assert.equal(getAccessToken(), null);
});

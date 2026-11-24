import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Calendar, ChevronLeft, Globe, Lock, Plus, Trash2, Trophy, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import { listarCatalogoExercicios } from "@/lib/api/catalogo-exercicios-api";
import { amigosDe, listarAmizades, type Amigo } from "@/lib/api/amizades-api";
import { buscarUsuarioPorEmail } from "@/lib/api/usuarios-api";
import {
    atualizarDesafio,
    cancelarDesafio,
    buscarProgresso,
    convidarParticipante,
    criarDesafio,
    entrarNoDesafio,
    listarDesafios,
    listarParticipantes,
    responderParticipacao,
    sairDoDesafio,
} from "@/lib/api/desafios-api";
import type {
    CatalogoExercicioResponseDTO,
    DesafioParticipanteResponseDTO,
    DesafioItemResponseDTO,
    DesafioProgressoDTO,
    DesafioResponseDTO,
    EstadoParticipante,
    VisibilidadeBackend,
} from "@/lib/api/contracts";
import {
    CAMPOS_META,
    MAX_ITENS_DESAFIO,
    formatarPrazo,
    hojeEmSaoPaulo,
    itemDoDesafio,
    montarPedidoDesafio,
    resumoMetas,
    type ItemFormulario,
} from "@/lib/desafios-apresentacao";
import Aside from "@/components/aside";
import Header from "@/components/header";

// Chave do protótipo antigo, que guardava desafios apenas no navegador.
const CHAVE_LEGADA = "@motivafit:desafios";

type Aba = "meus" | "convites" | "publicos";
type Consulta<T> = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: T };

interface DesafioComParticipacao {
    desafio: DesafioResponseDTO;
    participantes: DesafioParticipanteResponseDTO[] | null;
    meuEstado: EstadoParticipante | null;
}

const ROTULO_ESTADO: Record<EstadoParticipante, string> = { CONVIDADO: "Convidado", ACEITO: "Participando", RECUSADO: "Recusou" };

function ignorar(error: unknown): boolean {
    return error instanceof ApiError && error.code === "SESSAO_ALTERADA" || error instanceof Error && error.name === "AbortError";
}

// ---------------------------------------------------------------------------
//  Página
// ---------------------------------------------------------------------------
export default function PaginaDesafios() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const usuarioId = Number(user?.id);
    const [menuAberto, setMenuAberto] = useState(false);
    const [aba, setAba] = useState<Aba>("meus");
    const [consulta, setConsulta] = useState<Consulta<DesafioComParticipacao[]>>({ status: "carregando" });
    const [versao, setVersao] = useState(0);
    const [formulario, setFormulario] = useState<{ aberto: false } | { aberto: true; editando: DesafioResponseDTO | null }>({ aberto: false });
    const [abertoId, setAbertoId] = useState<number | null>(null);
    const recarregar = useCallback(() => setVersao((valor) => valor + 1), []);

    useEffect(() => {
        try { localStorage.removeItem(CHAVE_LEGADA); } catch { /* armazenamento bloqueado */ }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        setConsulta((atual) => atual.status === "sucesso" ? atual : { status: "carregando" });
        listarDesafios(signal).then(async (desafios) => {
            // A API não informa a participação na listagem: consulta os participantes de cada desafio.
            const itens = await Promise.all(desafios.map(async (desafio): Promise<DesafioComParticipacao> => {
                try {
                    const participantes = await listarParticipantes(desafio.id, signal);
                    const meu = participantes.find((item) => item.usuarioId === usuarioId);
                    return { desafio, participantes, meuEstado: meu?.estado ?? (desafio.souCriador ? "ACEITO" : null) };
                } catch (error) {
                    if (ignorar(error)) throw error;
                    return { desafio, participantes: null, meuEstado: desafio.souCriador ? "ACEITO" : null };
                }
            }));
            if (!signal.aborted) setConsulta({ status: "sucesso", dados: itens });
        }).catch((error: unknown) => {
            if (signal.aborted || ignorar(error)) return;
            setConsulta({ status: "erro", mensagem: mensagemAutenticacao(error) });
        });
        return () => controller.abort();
    }, [versao, usuarioId]);

    const todos = consulta.status === "sucesso" ? consulta.dados : [];
    const meus = todos.filter((item) => item.desafio.souCriador || item.meuEstado === "ACEITO");
    const convites = todos.filter((item) => !item.desafio.souCriador && item.meuEstado === "CONVIDADO");
    // Todos os desafios públicos, inclusive os criados pelo usuário e os de que ele já participa;
    // o cartão indica "Criado por você" ou o estado da participação.
    const publicos = todos.filter((item) => item.desafio.visibilidade === "PUBLICO");
    const aberto = todos.find((item) => item.desafio.id === abertoId) ?? null;

    function aoSalvar(desafio: DesafioResponseDTO) {
        setFormulario({ aberto: false });
        setAba("meus");
        setAbertoId(desafio.id);
        recarregar();
    }

    const listas: Record<Aba, { itens: DesafioComParticipacao[]; vazio: string }> = {
        meus: { itens: meus, vazio: "Você ainda não criou nem participa de nenhum desafio." },
        convites: { itens: convites, vazio: "Nenhum convite pendente." },
        publicos: { itens: publicos, vazio: "Nenhum desafio público disponível no momento." },
    };

    return (
        <div className="flex min-h-screen bg-background">
            <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={saindo} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    email={user?.email ?? ""}
                    menuAberto={menuAberto}
                    setMenuAberto={setMenuAberto}
                    title="Desafios"
                    subtitle="Crie desafios com metas e prazo e convide seus amigos."
                />
                <main className="min-w-0 flex-1 p-4 sm:p-6">
                    <div className="mx-auto max-w-5xl space-y-6">
                        {aberto ? (
                            <DetalheDesafio
                                item={aberto}
                                onVoltar={() => setAbertoId(null)}
                                onEditar={() => setFormulario({ aberto: true, editando: aberto.desafio })}
                                onAlterado={recarregar}
                                onRemovido={() => { setAbertoId(null); recarregar(); }}
                            />
                        ) : (
                            <>
                                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                                    <div role="tablist" aria-label="Listas de desafios" className="flex flex-wrap gap-2">
                                        {([
                                            ["meus", "Meus desafios", Trophy],
                                            ["convites", `Convites${convites.length ? ` (${convites.length})` : ""}`, UserPlus],
                                            ["publicos", "Desafios públicos", Globe],
                                        ] as const).map(([valor, rotulo, Icone]) => (
                                            <Button key={valor} type="button" role="tab" aria-selected={aba === valor}
                                                variant={aba === valor ? "default" : "outline"} onClick={() => setAba(valor)}>
                                                <Icone className="mr-2 h-4 w-4" />{rotulo}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button type="button" className="gap-2" onClick={() => setFormulario({ aberto: true, editando: null })}>
                                        <Plus className="h-4 w-4" />Criar desafio
                                    </Button>
                                </div>

                                {consulta.status === "carregando" && <p role="status">Carregando desafios…</p>}
                                {consulta.status === "erro" && <div className="space-y-2">
                                    <p role="alert" className="text-sm text-destructive">{consulta.mensagem}</p>
                                    <Button type="button" variant="outline" onClick={recarregar}>Tentar carregar desafios novamente</Button>
                                </div>}
                                {consulta.status === "sucesso" && <>
                                    {aba === "publicos" && <p className="text-sm text-muted-foreground">
                                        Desafios abertos a todos, inclusive os seus. Abra um desafio para ver as metas, o progresso e participar.
                                    </p>}
                                    <ListaDesafios itens={listas[aba].itens} vazio={listas[aba].vazio} onAbrir={setAbertoId} />
                                </>}
                            </>
                        )}
                    </div>
                </main>
            </div>
            <Dialog open={formulario.aberto} onOpenChange={(valor) => { if (!valor) setFormulario({ aberto: false }); }}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    {formulario.aberto && <FormularioDesafio
                        editando={formulario.editando}
                        onCancelar={() => setFormulario({ aberto: false })}
                        onSalvo={aoSalvar}
                    />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function formatarPercentual(valor: number): string {
    return valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

/** Mostra só os valores realizados que correspondem às metas do exercício. */
function resumoRealizado(progresso: DesafioProgressoDTO["itens"][number], meta: DesafioItemResponseDTO | undefined): string {
    const partes: string[] = [];
    if (meta?.metaSeries != null) partes.push(`${progresso.series}/${meta.metaSeries} séries`);
    if (meta?.metaRepeticoes != null) partes.push(`${progresso.repeticoes}/${meta.metaRepeticoes} repetições`);
    if (meta?.metaCargaKg != null) partes.push(`${progresso.cargaMaxKg ?? 0}/${meta.metaCargaKg} kg`);
    if (meta?.metaTempoS != null) partes.push(`${progresso.tempoS}/${meta.metaTempoS} s`);
    if (meta?.metaDistanciaM != null) partes.push(`${progresso.distanciaM}/${meta.metaDistanciaM} m`);
    return partes.join(", ") || "sem registros";
}

// ---------------------------------------------------------------------------
//  Lista
// ---------------------------------------------------------------------------
function ListaDesafios({ itens, vazio, onAbrir }: { itens: DesafioComParticipacao[]; vazio: string; onAbrir: (id: number) => void }) {
    if (itens.length === 0) {
        return <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{vazio}</CardContent></Card>;
    }
    return <div className="grid gap-4 md:grid-cols-2">
        {itens.map(({ desafio, participantes, meuEstado }) => (
            <Card key={desafio.id} className="transition-colors hover:border-primary/50">
                <CardHeader className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={desafio.visibilidade === "PUBLICO" ? "default" : "secondary"}>
                            {desafio.visibilidade === "PUBLICO" ? <><Globe className="mr-1 h-3 w-3" />Público</> : <><Lock className="mr-1 h-3 w-3" />Privado</>}
                        </Badge>
                        {participantes && <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />
                            {participantes.filter((item) => item.estado === "ACEITO").length}</Badge>}
                        {desafio.souCriador && <Badge variant="outline">Criado por você</Badge>}
                        {!desafio.souCriador && meuEstado && <Badge variant="outline">{ROTULO_ESTADO[meuEstado]}</Badge>}
                    </div>
                    <CardTitle className="text-lg">{desafio.titulo}</CardTitle>
                    {desafio.descricao && <CardDescription className="line-clamp-2">{desafio.descricao}</CardDescription>}
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />Até {formatarPrazo(desafio.prazo)} · {desafio.itens.length} exercício(s)
                    </p>
                </CardHeader>
                <CardContent>
                    <Button size="sm" type="button" onClick={() => onAbrir(desafio.id)} aria-label={`Ver detalhes de ${desafio.titulo}`}>Ver detalhes</Button>
                </CardContent>
            </Card>
        ))}
    </div>;
}

// ---------------------------------------------------------------------------
//  Detalhe
// ---------------------------------------------------------------------------
function DetalheDesafio({ item, onVoltar, onEditar, onAlterado, onRemovido }: {
    item: DesafioComParticipacao;
    onVoltar: () => void;
    onEditar: () => void;
    onAlterado: () => void;
    onRemovido: () => void;
}) {
    const { user } = useAuth();
    const { desafio, participantes, meuEstado } = item;
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [confirmarCancelamento, setConfirmarCancelamento] = useState(false);
    const [amigos, setAmigos] = useState<Consulta<Amigo[]>>({ status: "carregando" });
    const [convidadoId, setConvidadoId] = useState("");
    const [emailConvite, setEmailConvite] = useState("");
    const [progresso, setProgresso] = useState<Consulta<DesafioProgressoDTO[]>>({ status: "carregando" });

    useEffect(() => {
        const controller = new AbortController();
        buscarProgresso(desafio.id, controller.signal).then(
            (dados) => setProgresso({ status: "sucesso", dados }),
            (error: unknown) => { if (!ignorar(error)) setProgresso({ status: "erro", mensagem: mensagemAutenticacao(error) }); },
        );
        return () => controller.abort();
    }, [desafio.id, participantes]);

    useEffect(() => {
        if (!desafio.souCriador || !user) return;
        const controller = new AbortController();
        listarAmizades(controller.signal).then(
            (lista) => setAmigos({ status: "sucesso", dados: amigosDe(lista, Number(user.id)) }),
            (error: unknown) => { if (!ignorar(error)) setAmigos({ status: "erro", mensagem: mensagemAutenticacao(error) }); },
        );
        return () => controller.abort();
    }, [desafio.souCriador, user]);

    async function executar(acao: () => Promise<unknown>, sucesso: string, depois: () => void = onAlterado) {
        if (enviando) return;
        setEnviando(true);
        setErro("");
        setAviso("");
        try {
            await acao();
            setAviso(sucesso);
            depois();
        } catch (error) {
            if (!ignorar(error)) setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    const jaNoDesafio = new Set((participantes ?? []).filter((p) => p.estado !== "RECUSADO").map((p) => p.usuarioId));
    const convidaveis = amigos.status === "sucesso" ? amigos.dados.filter((amigo) => !jaNoDesafio.has(amigo.usuarioId)) : [];

    return <div className="space-y-4">
        <Button type="button" variant="ghost" className="gap-1.5" onClick={onVoltar}><ChevronLeft className="h-4 w-4" />Voltar para a lista</Button>
        <Card>
            <CardHeader className="space-y-2">
                <div className="flex flex-wrap gap-2">
                    <Badge variant={desafio.visibilidade === "PUBLICO" ? "default" : "secondary"}>{desafio.visibilidade === "PUBLICO" ? "Público" : "Privado"}</Badge>
                    {meuEstado && !desafio.souCriador && <Badge variant="outline">{ROTULO_ESTADO[meuEstado]}</Badge>}
                </div>
                <h2 className="text-xl font-semibold leading-none tracking-tight">{desafio.titulo}</h2>
                {desafio.descricao && <CardDescription>{desafio.descricao}</CardDescription>}
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />Prazo: {formatarPrazo(desafio.prazo)} (inclusive)</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <section aria-labelledby="desafio-metas" className="space-y-2">
                    <h3 id="desafio-metas" className="font-semibold">Exercícios e metas</h3>
                    <ul className="divide-y rounded-lg border">
                        {desafio.itens.map((meta) => <li key={meta.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                            <span className="font-medium">{meta.exercicioNome}</span>
                            <span className="text-muted-foreground">{resumoMetas(meta)}</span>
                        </li>)}
                    </ul>
                </section>

                <section aria-labelledby="desafio-participantes" className="space-y-2">
                    <h3 id="desafio-participantes" className="font-semibold">Participantes</h3>
                    {participantes === null ? <p className="text-sm text-muted-foreground">Não foi possível carregar os participantes.</p>
                        : participantes.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum participante.</p>
                            : <ul className="divide-y rounded-lg border">
                                {participantes.map((p) => <li key={p.usuarioId} className="flex items-center justify-between gap-2 p-3 text-sm">
                                    <span>{p.email}</span><Badge variant="outline">{ROTULO_ESTADO[p.estado]}</Badge>
                                </li>)}
                            </ul>}
                </section>

                <section aria-labelledby="desafio-progresso" className="space-y-2">
                    <h3 id="desafio-progresso" className="font-semibold">Progresso</h3>
                    <p className="text-xs text-muted-foreground">Soma dos registros feitos desde a criação do desafio até o fim do prazo. Carga considera o maior valor.</p>
                    {progresso.status === "carregando" && <p role="status" className="text-sm">Carregando progresso…</p>}
                    {progresso.status === "erro" && <p role="alert" className="text-sm text-destructive">{progresso.mensagem}</p>}
                    {progresso.status === "sucesso" && (progresso.dados.length === 0
                        ? <p className="text-sm text-muted-foreground">Nenhum participante confirmado ainda.</p>
                        : <ol className="space-y-3" aria-label="Progresso dos participantes">
                            {progresso.dados.map((linha) => <li key={linha.usuarioId} className="space-y-1.5 rounded-lg border p-3 text-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="break-all font-medium">{linha.email ?? `Usuário ${linha.usuarioId}`}{linha.usuarioId === Number(user?.id) && " (você)"}</span>
                                    <span className="tabular-nums">{linha.concluido ? "Concluído" : `${formatarPercentual(linha.percentual)}%`}</span>
                                </div>
                                <div className="h-2 rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={100}
                                    aria-valuenow={linha.percentual} aria-label={`Progresso de ${linha.email ?? linha.usuarioId}`}>
                                    <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, linha.percentual)}%` }} />
                                </div>
                                <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                                    {linha.itens.map((itemProgresso) => {
                                        const meta = desafio.itens.find((item) => item.catalogoId === itemProgresso.catalogoId);
                                        return <li key={itemProgresso.catalogoId}>
                                            {meta?.exercicioNome ?? "Exercício"}: {resumoRealizado(itemProgresso, meta)} ({formatarPercentual(itemProgresso.percentual)}%)
                                        </li>;
                                    })}
                                </ul>
                            </li>)}
                        </ol>)}
                </section>

                {desafio.souCriador && <section aria-labelledby="desafio-convidar" className="space-y-2">
                    <h3 id="desafio-convidar" className="font-semibold">Convidar amigo</h3>
                    {amigos.status === "carregando" && <p role="status" className="text-sm">Carregando amigos…</p>}
                    {amigos.status === "erro" && <p role="alert" className="text-sm text-destructive">{amigos.mensagem}</p>}
                    {amigos.status === "sucesso" && (convidaveis.length === 0
                        ? <p className="text-sm text-muted-foreground">Nenhum amigo disponível para convite. Adicione amigos na página Amigos.</p>
                        : <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
                            event.preventDefault();
                            if (!convidadoId) return;
                            void executar(() => convidarParticipante(desafio.id, Number(convidadoId)), "Convite enviado.", () => { setConvidadoId(""); onAlterado(); });
                        }}>
                            <div className="space-y-1.5">
                                <Label htmlFor="desafio-amigo">Amigo</Label>
                                <select id="desafio-amigo" className="h-9 min-w-56 rounded-md border bg-background px-2 text-sm" value={convidadoId} onChange={(event) => setConvidadoId(event.target.value)}>
                                    <option value="">Selecione</option>
                                    {convidaveis.map((amigo) => <option key={amigo.usuarioId} value={amigo.usuarioId}>{amigo.email}</option>)}
                                </select>
                            </div>
                            <Button type="submit" disabled={enviando || !convidadoId}>Convidar</Button>
                        </form>)}
                    <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
                        event.preventDefault();
                        const email = emailConvite.trim();
                        if (!email) return;
                        void executar(async () => {
                            const pessoa = await buscarUsuarioPorEmail(email);
                            await convidarParticipante(desafio.id, pessoa.id);
                        }, "Convite enviado.", () => { setEmailConvite(""); onAlterado(); });
                    }}>
                        <div className="space-y-1.5">
                            <Label htmlFor="desafio-convite-email">Ou convide pelo e-mail</Label>
                            <Input id="desafio-convite-email" type="email" autoComplete="off" className="w-72 max-w-full" value={emailConvite} onChange={(event) => setEmailConvite(event.target.value)} />
                        </div>
                        <Button type="submit" variant="outline" disabled={enviando || !emailConvite.trim()}>Convidar por e-mail</Button>
                    </form>
                </section>}

                {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                {aviso && <p role="status" className="text-sm text-primary">{aviso}</p>}

                <div className="flex flex-wrap gap-2">
                    {desafio.souCriador && <>
                        <Button type="button" variant="outline" onClick={onEditar}>Editar desafio</Button>
                        <Button type="button" variant="outline" className="gap-1.5 text-destructive hover:bg-destructive/10" onClick={() => setConfirmarCancelamento(true)}>
                            <Trash2 className="h-4 w-4" />Cancelar desafio
                        </Button>
                    </>}
                    {!desafio.souCriador && desafio.visibilidade === "PUBLICO" && (meuEstado === null || meuEstado === "RECUSADO") && (
                        <Button type="button" disabled={enviando} onClick={() => void executar(() => entrarNoDesafio(desafio.id), "Você entrou no desafio.")}>Participar do desafio</Button>
                    )}
                    {!desafio.souCriador && meuEstado === "CONVIDADO" && <>
                        <Button type="button" disabled={enviando} onClick={() => void executar(() => responderParticipacao(desafio.id, "ACEITO"), "Você entrou no desafio.")}>Aceitar convite</Button>
                        <Button type="button" variant="outline" disabled={enviando} onClick={() => void executar(() => responderParticipacao(desafio.id, "RECUSADO"), "Convite recusado.")}>Recusar convite</Button>
                    </>}
                    {!desafio.souCriador && meuEstado === "ACEITO" && (
                        <Button type="button" variant="outline" disabled={enviando} onClick={() => void executar(() => sairDoDesafio(desafio.id), "Você saiu do desafio.")}>Sair do desafio</Button>
                    )}
                </div>
            </CardContent>
        </Card>

        <Dialog open={confirmarCancelamento} onOpenChange={setConfirmarCancelamento}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancelar desafio</DialogTitle>
                    <DialogDescription>O desafio "{desafio.titulo}" deixará de aparecer para todos. Os registros de execução são preservados.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setConfirmarCancelamento(false)} disabled={enviando}>Voltar</Button>
                    <Button type="button" variant="destructive" disabled={enviando} onClick={() => {
                        setConfirmarCancelamento(false);
                        void executar(() => cancelarDesafio(desafio.id), "Desafio cancelado.", onRemovido);
                    }}>Confirmar cancelamento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>;
}

// ---------------------------------------------------------------------------
//  Formulário (criar e editar)
// ---------------------------------------------------------------------------
function FormularioDesafio({ editando, onCancelar, onSalvo }: {
    editando: DesafioResponseDTO | null;
    onCancelar: () => void;
    onSalvo: (desafio: DesafioResponseDTO) => void;
}) {
    const [titulo, setTitulo] = useState(editando?.titulo ?? "");
    const [descricao, setDescricao] = useState(editando?.descricao ?? "");
    const [prazo, setPrazo] = useState(editando?.prazo ?? "");
    const [visibilidade, setVisibilidade] = useState<VisibilidadeBackend>(editando?.visibilidade ?? "PRIVADO");
    const [itens, setItens] = useState<ItemFormulario[]>(editando?.itens.map(itemDoDesafio) ?? []);
    const [catalogo, setCatalogo] = useState<Consulta<CatalogoExercicioResponseDTO[]>>({ status: "carregando" });
    const [selecionado, setSelecionado] = useState("");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        listarCatalogoExercicios(controller.signal).then(
            (dados) => setCatalogo({ status: "sucesso", dados }),
            (error: unknown) => { if (!ignorar(error)) setCatalogo({ status: "erro", mensagem: mensagemAutenticacao(error) }); },
        );
        return () => controller.abort();
    }, []);

    const disponiveis = catalogo.status === "sucesso" ? catalogo.dados.filter((item) => !itens.some((atual) => atual.catalogoId === item.id)) : [];

    function incluir() {
        const item = disponiveis.find((entrada) => entrada.id === Number(selecionado));
        if (!item) return;
        setItens((atual) => [...atual, {
            chave: `novo-${item.id}-${Date.now()}`, catalogoId: item.id, nome: item.nome, modalidade: item.modalidade,
            metaCargaKg: "", metaRepeticoes: "", metaSeries: "", metaTempoS: "", metaDistanciaM: "",
        }]);
        setSelecionado("");
    }

    function alterar(chave: string, campo: keyof ItemFormulario, valor: string) {
        setItens((atual) => atual.map((item) => item.chave === chave ? { ...item, [campo]: valor } : item));
    }

    async function salvar(event: FormEvent) {
        event.preventDefault();
        if (enviando) return;
        const pedido = montarPedidoDesafio({ titulo, descricao, prazo, visibilidade, itens });
        if (typeof pedido === "string") {
            setErro(pedido);
            return;
        }
        setEnviando(true);
        setErro("");
        try {
            const salvo = editando ? await atualizarDesafio(editando.id, pedido) : await criarDesafio(pedido);
            onSalvo(salvo);
        } catch (error) {
            if (!ignorar(error)) setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    return <form onSubmit={(event) => void salvar(event)} className="space-y-4" aria-busy={enviando}>
        <DialogHeader>
            <DialogTitle>{editando ? "Editar desafio" : "Novo desafio"}</DialogTitle>
            <DialogDescription>Escolha exercícios do catálogo, defina as metas e o prazo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
            <Label htmlFor="desafio-titulo">Título</Label>
            <Input id="desafio-titulo" value={titulo} maxLength={100} onChange={(event) => setTitulo(event.target.value)} />
        </div>
        <div className="space-y-1.5">
            <Label htmlFor="desafio-descricao">Descrição (opcional)</Label>
            <textarea id="desafio-descricao" value={descricao} maxLength={1000} rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm" onChange={(event) => setDescricao(event.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
                <Label htmlFor="desafio-prazo">Prazo (último dia)</Label>
                <Input id="desafio-prazo" type="date" min={hojeEmSaoPaulo()} value={prazo} onChange={(event) => setPrazo(event.target.value)} />
            </div>
            <fieldset className="space-y-1.5">
                <legend className="text-sm font-medium">Visibilidade</legend>
                <div className="flex gap-2">
                    {(["PRIVADO", "PUBLICO"] as const).map((valor) => <Button key={valor} type="button" size="sm"
                        variant={visibilidade === valor ? "secondary" : "outline"} aria-pressed={visibilidade === valor}
                        onClick={() => setVisibilidade(valor)}>{valor === "PUBLICO" ? "Público" : "Privado"}</Button>)}
                </div>
            </fieldset>
        </div>

        <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Exercícios ({itens.length}/{MAX_ITENS_DESAFIO})</legend>
            {catalogo.status === "carregando" && <p role="status" className="text-sm">Carregando catálogo…</p>}
            {catalogo.status === "erro" && <p role="alert" className="text-sm text-destructive">{catalogo.mensagem}</p>}
            {catalogo.status === "sucesso" && <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                    <Label htmlFor="desafio-catalogo">Exercício do catálogo</Label>
                    <select id="desafio-catalogo" className="h-9 min-w-56 rounded-md border bg-background px-2 text-sm" value={selecionado} onChange={(event) => setSelecionado(event.target.value)}>
                        <option value="">Selecione</option>
                        {disponiveis.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                    </select>
                </div>
                <Button type="button" variant="outline" disabled={!selecionado || itens.length >= MAX_ITENS_DESAFIO} onClick={incluir}>Incluir exercício</Button>
            </div>}
            {itens.map((item) => <div key={item.chave} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.nome}</span>
                    <Button type="button" size="sm" variant="ghost" aria-label={`Remover ${item.nome}`}
                        onClick={() => setItens((atual) => atual.filter((entrada) => entrada.chave !== item.chave))}>Remover</Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                    {CAMPOS_META.filter((definicao) => definicao.modalidades.includes(item.modalidade)).map((definicao) => (
                        <div key={definicao.campo} className="space-y-1">
                            <Label htmlFor={`${item.chave}-${definicao.campo}`} className="text-xs">{definicao.rotulo}</Label>
                            <Input id={`${item.chave}-${definicao.campo}`} inputMode="decimal" aria-label={`${definicao.rotulo} de ${item.nome}`}
                                value={item[definicao.campo]} onChange={(event) => alterar(item.chave, definicao.campo, event.target.value)} />
                        </div>
                    ))}
                </div>
            </div>)}
        </fieldset>

        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancelar} disabled={enviando}>Cancelar</Button>
            <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar desafio"}</Button>
        </DialogFooter>
    </form>;
}

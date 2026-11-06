import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Dumbbell, Home, LogOut, Play, Plus, Shield, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import { listarCatalogoExercicios } from "@/lib/api/catalogo-exercicios-api";
import { adicionarExercicioAoTreino, listarExerciciosDoTreino } from "@/lib/api/exercicios-api";
import { atualizarTreino, criarTreino, excluirTreino, listarTreinos } from "@/lib/api/treinos-api";
import type { CatalogoExercicioResponseDTO, ExercicioResponseDTO, TipoTreinoBackend, TreinoResponseDTO, VisibilidadeBackend } from "@/lib/api/contracts";
import {
    ROTULO_TIPO,
    ROTULO_VISIBILIDADE,
    filtrarCatalogo,
    formatarDataTreino,
    gruposDoCatalogo,
    validarNomeTreino,
    type FiltroModalidade,
} from "@/lib/treinos-apresentacao";

type Consulta<T> =
    | { status: "carregando" }
    | { status: "sucesso"; dados: T }
    | { status: "erro"; mensagem: string };

function ignorarConsulta(error: unknown): boolean {
    if (error instanceof ApiError && error.code === "SESSAO_ALTERADA") return true;
    return error instanceof Error && error.name === "AbortError";
}

function descartarTreinosLocais(): void {
    try {
        localStorage.removeItem("@motivafit:treinos");
        localStorage.removeItem("@motivafit:meus-exercicios");
    } catch {
        // Armazenamento bloqueado não reintroduz a lista local.
    }
}

function useConsulta<T>(buscar: (signal: AbortSignal) => Promise<T>, versao: number) {
    const [estado, setEstado] = useState<Consulta<T>>({ status: "carregando" });
    const [versaoCarregada, setVersaoCarregada] = useState(versao);
    if (versaoCarregada !== versao) {
        setVersaoCarregada(versao);
        setEstado({ status: "carregando" });
    }

    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        buscar(controller.signal).then(
            (dados) => {
                if (ativo) setEstado({ status: "sucesso", dados });
            },
            (error: unknown) => {
                if (!ativo || ignorarConsulta(error)) return;
                setEstado({ status: "erro", mensagem: mensagemAutenticacao(error) });
            },
        );
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [buscar, versao]);

    return [estado, setEstado] as const;
}

function iniciais(email: string): string {
    const base = email.trim().slice(0, 2).toUpperCase();
    return base || "AL";
}

type ExercicioSelecionado = {
    chave: string;
    catalogoExercicioId: number;
    meta: string;
    metaRecorde: string;
    persistidoId: number | null;
};

function validarExerciciosSelecionados(itens: ExercicioSelecionado[], nomeDe: (id: number) => string): string | null {
    for (const item of itens) {
        if (item.persistidoId !== null) continue;
        const nome = nomeDe(item.catalogoExercicioId);
        const meta = item.meta.trim();
        if (!meta) return `Informe a meta de ${nome}.`;
        if (meta.length > 255) return `A meta de ${nome} deve ter no máximo 255 caracteres.`;
        if (item.metaRecorde.trim().length > 255) return `O recorde de ${nome} deve ter no máximo 255 caracteres.`;
    }
    return null;
}

export default function PaginaTreinos() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const [versaoTreinos, setVersaoTreinos] = useState(0);
    const [versaoCatalogo, setVersaoCatalogo] = useState(0);
    const [treinos, setTreinos] = useConsulta(listarTreinos, versaoTreinos);
    const [catalogo] = useConsulta(listarCatalogoExercicios, versaoCatalogo);
    const [fichas, setFichas] = useState<Record<number, Consulta<ExercicioResponseDTO[]>>>({});
    const [formularioAberto, setFormularioAberto] = useState(false);
    const [editando, setEditando] = useState<TreinoResponseDTO | null>(null);
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState<TipoTreinoBackend>("MUSCULACAO");
    const [visibilidade, setVisibilidade] = useState<VisibilidadeBackend>("PRIVADO");
    const [erroForm, setErroForm] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [exclusao, setExclusao] = useState<TreinoResponseDTO | null>(null);
    const [erroExclusao, setErroExclusao] = useState("");
    const [excluindo, setExcluindo] = useState(false);
    const [selecionados, setSelecionados] = useState<ExercicioSelecionado[]>([]);
    const [textoCatalogo, setTextoCatalogo] = useState("");
    const [grupoCatalogo, setGrupoCatalogo] = useState("TODOS");
    const [modalidadeCatalogo, setModalidadeCatalogo] = useState<FiltroModalidade>("TODAS");
    const montado = useRef(true);
    const salvando = useRef(false);
    const exclusaoEmAndamento = useRef(false);

    useEffect(() => {
        montado.current = true;
        descartarTreinosLocais();
        return () => {
            montado.current = false;
        };
    }, []);

    useEffect(() => {
        if (treinos.status !== "sucesso") return;
        const controller = new AbortController();
        let ativo = true;
        void Promise.all(treinos.dados.map(async (treino) => {
            try {
                const dados = await listarExerciciosDoTreino(treino.id, controller.signal);
                return [treino.id, { status: "sucesso", dados }] as const;
            } catch (error) {
                if (!ativo || ignorarConsulta(error)) return null;
                return [treino.id, { status: "erro", mensagem: mensagemAutenticacao(error) }] as const;
            }
        })).then((resultados) => {
            if (!ativo) return;
            const proximas: Record<number, Consulta<ExercicioResponseDTO[]>> = {};
            for (const item of resultados) if (item) proximas[item[0]] = item[1];
            setFichas(proximas);
        });
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [treinos]);

    function abrirCriacao() {
        setEditando(null);
        setNome("");
        setTipo("MUSCULACAO");
        setVisibilidade("PRIVADO");
        setSelecionados([]);
        setErroForm("");
        setFormularioAberto(true);
    }

    function abrirEdicao(treino: TreinoResponseDTO) {
        setEditando(treino);
        setNome(treino.nome);
        setTipo(treino.tipo);
        setVisibilidade(treino.visibilidade);
        setSelecionados([]);
        setErroForm("");
        setFormularioAberto(true);
        void listarExerciciosDoTreino(treino.id).then(
            (lista) => {
                if (!montado.current) return;
                setSelecionados(lista.map((item) => ({
                    chave: `salvo-${item.id}`,
                    catalogoExercicioId: item.catalogoExercicioId,
                    meta: item.meta,
                    metaRecorde: item.metaRecorde ?? "",
                    persistidoId: item.id,
                })));
            },
            (error: unknown) => {
                if (!montado.current || ignorarConsulta(error)) return;
                setErroForm(mensagemAutenticacao(error));
            },
        );
    }

    function adicionarDoCatalogo(item: CatalogoExercicioResponseDTO) {
        setSelecionados((atual) => [...atual, {
            chave: `novo-${item.id}-${atual.length}-${Date.now()}`,
            catalogoExercicioId: item.id,
            meta: "",
            metaRecorde: "",
            persistidoId: null,
        }]);
    }

    function publicar(treino: TreinoResponseDTO) {
        if (treinos.status !== "sucesso") {
            setVersaoTreinos((versao) => versao + 1);
            return;
        }
        setTreinos({
            status: "sucesso",
            dados: [treino, ...treinos.dados.filter((item) => item.id !== treino.id)],
        });
    }

    async function salvarTreino(event: FormEvent) {
        event.preventDefault();
        if (salvando.current) return;
        const validacao = validarNomeTreino(nome) ?? validarExerciciosSelecionados(selecionados, nomeDoCatalogo);
        if (validacao) {
            setErroForm(validacao);
            return;
        }
        salvando.current = true;
        setEnviando(true);
        setErroForm("");
        const pedido = { nome: nome.trim(), tipo, visibilidade };
        const pendentes = selecionados.filter((item) => item.persistidoId === null);
        try {
            const salvo = editando
                ? await atualizarTreino(editando.id, pedido)
                : await criarTreino(pedido);
            if (!montado.current) return;
            publicar(salvo);
            setEditando(salvo);
            const gravados = [...selecionados];
            for (const item of pendentes) {
                try {
                    const resposta = await adicionarExercicioAoTreino(salvo.id, {
                        meta: item.meta.trim(),
                        metaRecorde: item.metaRecorde.trim() || null,
                        treinoId: salvo.id,
                        catalogoExercicioId: item.catalogoExercicioId,
                    });
                    const indice = gravados.findIndex((atual) => atual.chave === item.chave);
                    if (indice >= 0) gravados[indice] = { ...item, persistidoId: resposta.id };
                } catch (error) {
                    if (!montado.current || ignorarConsulta(error)) return;
                    setSelecionados(gravados);
                    setErroForm(`O treino foi salvo, mas não foi possível incluir ${nomeDoCatalogo(item.catalogoExercicioId)}. ${mensagemAutenticacao(error)}`);
                    return;
                }
            }
            if (!montado.current) return;
            setFormularioAberto(false);
        } catch (error) {
            if (!montado.current || ignorarConsulta(error)) return;
            setErroForm(mensagemAutenticacao(error));
        } finally {
            salvando.current = false;
            if (montado.current) setEnviando(false);
        }
    }

    async function confirmarExclusao() {
        if (!exclusao || exclusaoEmAndamento.current) return;
        exclusaoEmAndamento.current = true;
        setExcluindo(true);
        setErroExclusao("");
        try {
            await excluirTreino(exclusao.id);
            if (!montado.current) return;
            setTreinos((atual) => atual.status !== "sucesso" ? atual : {
                status: "sucesso",
                dados: atual.dados.filter((item) => item.id !== exclusao.id),
            });
            setExclusao(null);
        } catch (error) {
            if (!montado.current || ignorarConsulta(error)) return;
            setErroExclusao(mensagemAutenticacao(error));
        } finally {
            exclusaoEmAndamento.current = false;
            if (montado.current) setExcluindo(false);
        }
    }

    const meusTreinos = treinos.status === "sucesso" ? treinos.dados.filter((item) => item.meuTreino) : [];
    const treinosPublicos = treinos.status === "sucesso" ? treinos.dados.filter((item) => !item.meuTreino) : [];
    const itensCatalogo = catalogo.status === "sucesso" ? catalogo.dados : [];
    const grupos = gruposDoCatalogo(itensCatalogo);
    const grupoVisivel = grupoCatalogo !== "TODOS" && !grupos.includes(grupoCatalogo) ? "TODOS" : grupoCatalogo;
    const catalogoFiltrado = filtrarCatalogo(itensCatalogo, {
        texto: textoCatalogo,
        grupo: grupoVisivel,
        modalidade: modalidadeCatalogo,
    });
    function nomeDoCatalogo(id: number): string {
        return itensCatalogo.find((item) => item.id === id)?.nome ?? `Exercício ${id}`;
    }

    const email = user?.email ?? "";

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="hidden w-64 flex-col border-r bg-muted/30 p-6 md:flex">
                <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    <span className="font-heading text-lg font-bold">MotivaFit</span>
                </div>
                <nav className="flex flex-1 flex-col gap-1.5">
                    <Button variant="ghost" className="justify-start gap-2.5" asChild>
                        <Link to="/principal"><Home className="h-4 w-4" />Início</Link>
                    </Button>
                    <Button variant="secondary" className="justify-start gap-2.5" asChild>
                        <Link to="/treinos"><Dumbbell className="h-4 w-4" />Meus Treinos</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5" asChild>
                        <Link to="/treinos"><Play className="h-4 w-4" />Realizar treino</Link>
                    </Button>
                    {isAdmin && (
                        <>
                            <Separator className="my-3" />
                            <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" asChild>
                                <Link to="/admin"><Shield className="h-3.5 w-3.5" />Painel Administrativo</Link>
                            </Button>
                        </>
                    )}
                </nav>
                <Separator className="my-4" />
                <Button
                    variant="ghost"
                    className="justify-start gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => { void logout(); }}
                    disabled={saindo}
                >
                    <LogOut className="h-4 w-4" />Sair
                </Button>
            </aside>

            <div className="flex flex-1 flex-col overflow-x-hidden">
                <header className="flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur">
                    <div>
                        <p className="mb-1 md:hidden">
                            <Link to="/principal" className="text-sm text-primary underline-offset-4 hover:underline">Início</Link>
                        </p>
                        <h1 className="font-heading text-xl font-bold">Meus Treinos</h1>
                        <p className="text-xs text-muted-foreground">Gerenciamento e montagem de treinos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="outline" className="h-9 w-9" />
                        <div className="hidden text-right sm:block">
                            <span className="block text-sm font-medium">{email || "Aluno"}</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                {iniciais(email)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 space-y-8 p-6">
                    <section className="mx-auto max-w-5xl space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-heading text-lg font-bold">Treinos da conta</h2>
                            <Button onClick={abrirCriacao} disabled={enviando} className="gap-2">
                                <Plus className="h-4 w-4" />Criar treino
                            </Button>
                        </div>

                        {formularioAberto && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>{editando ? "Editar treino" : "Novo treino"}</CardTitle>
                                    <CardDescription>
                                        O treino é gravado primeiro. Cada exercício escolhido é associado em seguida, com a meta informada.
                                    </CardDescription>
                                </CardHeader>
                                <form onSubmit={(event) => { void salvarTreino(event); }}>
                                    <fieldset disabled={enviando} className="space-y-4">
                                        <CardContent className="space-y-4">
                                            {erroForm && <p role="alert" className="text-sm text-destructive">{erroForm}</p>}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="nomeTreino">Nome do treino</Label>
                                                <Input
                                                    id="nomeTreino"
                                                    value={nome}
                                                    maxLength={150}
                                                    onChange={(event) => setNome(event.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label id="rotulo-tipo">Modalidade do treino</Label>
                                                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="rotulo-tipo">
                                                    {(["MUSCULACAO", "AEROBICO"] as const).map((opcao) => (
                                                        <Button
                                                            key={opcao}
                                                            type="button"
                                                            variant={tipo === opcao ? "default" : "outline"}
                                                            aria-pressed={tipo === opcao}
                                                            onClick={() => setTipo(opcao)}
                                                        >
                                                            {ROTULO_TIPO[opcao]}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label id="rotulo-visibilidade">Visibilidade</Label>
                                                <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="rotulo-visibilidade">
                                                    {(["PRIVADO", "PUBLICO"] as const).map((opcao) => (
                                                        <Button
                                                            key={opcao}
                                                            type="button"
                                                            variant={visibilidade === opcao ? "default" : "outline"}
                                                            aria-pressed={visibilidade === opcao}
                                                            onClick={() => setVisibilidade(opcao)}
                                                        >
                                                            {ROTULO_VISIBILIDADE[opcao]}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                            <ExerciciosSelecionados
                                                itens={selecionados}
                                                nomeDe={nomeDoCatalogo}
                                                onMeta={(chave, meta) => setSelecionados((atual) => atual.map((item) => item.chave === chave ? { ...item, meta } : item))}
                                                onRecorde={(chave, metaRecorde) => setSelecionados((atual) => atual.map((item) => item.chave === chave ? { ...item, metaRecorde } : item))}
                                                onRemover={(chave) => setSelecionados((atual) => atual.filter((item) => item.chave !== chave))}
                                            />
                                        </CardContent>
                                        <div className="flex items-center justify-between border-t p-4">
                                            <Button type="button" variant="outline" onClick={() => setFormularioAberto(false)}>Cancelar</Button>
                                            <Button type="submit">{enviando ? "Salvando…" : "Salvar treino"}</Button>
                                        </div>
                                    </fieldset>
                                </form>
                            </Card>
                        )}

                        {treinos.status === "carregando" && <p role="status">Carregando treinos…</p>}
                        {treinos.status === "erro" && (
                            <div role="alert" className="space-y-3 rounded-lg border border-destructive/40 p-4">
                                <p className="text-sm">{treinos.mensagem}</p>
                                <Button type="button" variant="outline" onClick={() => setVersaoTreinos((versao) => versao + 1)} disabled={enviando}>
                                    Tentar carregar treinos novamente
                                </Button>
                            </div>
                        )}
                        {treinos.status === "sucesso" && (
                            <div className="space-y-6">
                                <ListaTreinos
                                    titulo="Meus treinos"
                                    vazio="Nenhum treino criado."
                                    treinos={meusTreinos}
                                    fichas={fichas}
                                    nomeDe={nomeDoCatalogo}
                                    onEditar={abrirEdicao}
                                    onExcluir={(treino) => { setErroExclusao(""); setExclusao(treino); }}
                                />
                                <ListaTreinos
                                    titulo="Treinos públicos de outras pessoas"
                                    vazio="Nenhum treino público de outras pessoas."
                                    treinos={treinosPublicos}
                                    fichas={fichas}
                                    nomeDe={nomeDoCatalogo}
                                    onEditar={abrirEdicao}
                                    onExcluir={(treino) => { setErroExclusao(""); setExclusao(treino); }}
                                />
                            </div>
                        )}
                    </section>

                    <PainelCatalogo
                        estado={catalogo}
                        itens={catalogoFiltrado}
                        total={itensCatalogo.length}
                        texto={textoCatalogo}
                        grupo={grupoVisivel}
                        modalidade={modalidadeCatalogo}
                        grupos={grupos}
                        onTexto={setTextoCatalogo}
                        onGrupo={setGrupoCatalogo}
                        onModalidade={setModalidadeCatalogo}
                        onTentarNovamente={() => setVersaoCatalogo((versao) => versao + 1)}
                        onAdicionar={formularioAberto ? adicionarDoCatalogo : undefined}
                    />
                </main>
            </div>

            {exclusao && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="presentation">
                    <div role="dialog" aria-modal="true" aria-labelledby="titulo-exclusao" className="w-full max-w-md space-y-4 rounded-xl border bg-card p-5">
                        <h2 id="titulo-exclusao" className="font-heading text-lg font-bold">Excluir treino</h2>
                        <p className="text-sm text-muted-foreground">
                            Excluir “{exclusao.nome}”? Ele sai da listagem. Os registros históricos permanecem no servidor.
                        </p>
                        {erroExclusao && <p role="alert" className="text-sm text-destructive">{erroExclusao}</p>}
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setExclusao(null)} disabled={excluindo}>Cancelar</Button>
                            <Button type="button" variant="destructive" onClick={() => { void confirmarExclusao(); }} disabled={excluindo}>
                                {excluindo ? "Excluindo…" : "Confirmar exclusão"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExerciciosVisiveis({
    ficha,
    nomeDe,
}: {
    ficha?: Consulta<ExercicioResponseDTO[]>;
    nomeDe: (id: number) => string;
}) {
    if (!ficha || ficha.status === "carregando") return <p role="status">Carregando exercícios…</p>;
    if (ficha.status === "erro") return <p className="text-sm text-muted-foreground">{ficha.mensagem}</p>;
    if (ficha.dados.length === 0) return <p className="text-sm text-muted-foreground">Nenhum exercício neste treino.</p>;
    return (
        <ul className="space-y-1 text-sm">
            {ficha.dados.map((item) => (
                <li key={item.id}>{nomeDe(item.catalogoExercicioId)} — {item.meta}{item.metaRecorde ? ` · recorde ${item.metaRecorde}` : ""}</li>
            ))}
        </ul>
    );
}

function ExerciciosSelecionados({
    itens,
    nomeDe,
    onMeta,
    onRecorde,
    onRemover,
}: {
    itens: ExercicioSelecionado[];
    nomeDe: (id: number) => string;
    onMeta: (chave: string, meta: string) => void;
    onRecorde: (chave: string, recorde: string) => void;
    onRemover: (chave: string) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium">Exercícios do treino</h3>
            {itens.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum exercício selecionado. O treino pode ser salvo assim.</p>
            ) : (
                <ul className="space-y-3">
                    {itens.map((item) => {
                        const nome = nomeDe(item.catalogoExercicioId);
                        const idMeta = `meta-${item.chave}`;
                        return (
                            <li key={item.chave} className="space-y-2 rounded-lg border p-3">
                                <p className="text-sm font-medium">{nome}</p>
                                {item.persistidoId !== null ? (
                                    <p className="text-sm text-muted-foreground">Meta: {item.meta}{item.metaRecorde ? `. Recorde: ${item.metaRecorde}` : ""}</p>
                                ) : (
                                    <>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={idMeta}>Meta de {nome}</Label>
                                            <Input id={idMeta} value={item.meta} maxLength={255} onChange={(event) => onMeta(item.chave, event.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor={`recorde-${item.chave}`}>Recorde de {nome}</Label>
                                            <Input id={`recorde-${item.chave}`} value={item.metaRecorde} maxLength={255} onChange={(event) => onRecorde(item.chave, event.target.value)} />
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => onRemover(item.chave)}>Remover {nome}</Button>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

function ListaTreinos({
    titulo,
    vazio,
    treinos,
    fichas,
    nomeDe,
    onEditar,
    onExcluir,
}: {
    titulo: string;
    vazio: string;
    treinos: TreinoResponseDTO[];
    fichas: Record<number, Consulta<ExercicioResponseDTO[]>>;
    nomeDe: (id: number) => string;
    onEditar: (treino: TreinoResponseDTO) => void;
    onExcluir: (treino: TreinoResponseDTO) => void;
}) {
    return (
        <div className="space-y-3">
            <h3 className="font-heading text-base font-bold">{titulo}</h3>
            {treinos.length === 0 ? (
                <p className="text-sm text-muted-foreground">{vazio}</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {treinos.map((treino) => (
                        <Card key={treino.id}>
                            <CardHeader className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline">{ROTULO_TIPO[treino.tipo]}</Badge>
                                    <Badge variant="secondary">{ROTULO_VISIBILIDADE[treino.visibilidade]}</Badge>
                                </div>
                                <CardTitle className="text-lg">{treino.nome}</CardTitle>
                                <CardDescription>
                                    Criado em {formatarDataTreino(treino.createdAt)}. Atualizado em {formatarDataTreino(treino.updatedAt)}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ExerciciosVisiveis ficha={fichas[treino.id]} nomeDe={nomeDe} />
                                {treino.podeEditar ? (
                                    <div className="flex flex-wrap gap-2">
                                        <Button size="sm" asChild>
                                            <Link to={`/treinos/${treino.id}/realizar`}>Realizar treino</Link>
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onEditar(treino)}>
                                            <Edit3 className="h-4 w-4" />Editar
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => onExcluir(treino)}>
                                            <Trash2 className="h-4 w-4" />Excluir
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Você pode consultar este treino, mas não alterá-lo.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function PainelCatalogo({
    estado,
    itens,
    total,
    texto,
    grupo,
    modalidade,
    grupos,
    onTexto,
    onGrupo,
    onModalidade,
    onTentarNovamente,
    onAdicionar,
}: {
    estado: Consulta<CatalogoExercicioResponseDTO[]>;
    itens: CatalogoExercicioResponseDTO[];
    total: number;
    texto: string;
    grupo: string;
    modalidade: FiltroModalidade;
    grupos: string[];
    onTexto: (valor: string) => void;
    onGrupo: (valor: string) => void;
    onModalidade: (valor: FiltroModalidade) => void;
    onTentarNovamente: () => void;
    onAdicionar?: (item: CatalogoExercicioResponseDTO) => void;
}) {
    return (
        <section className="mx-auto max-w-5xl space-y-4">
            <div>
                <h2 className="font-heading text-lg font-bold">Catálogo de exercícios</h2>
                <p className="text-sm text-muted-foreground">
                    {onAdicionar
                        ? "Escolha um exercício do catálogo e informe a meta no treino. Exercícios pessoais não fazem parte do catálogo."
                        : "Abra a criação ou a edição de um treino para associar exercícios do catálogo."}
                </p>
            </div>
            {estado.status === "carregando" && <p role="status">Carregando catálogo…</p>}
            {estado.status === "erro" && (
                <div role="alert" className="space-y-3 rounded-lg border border-destructive/40 p-4">
                    <p className="text-sm">{estado.mensagem}</p>
                    <Button type="button" variant="outline" onClick={onTentarNovamente}>Tentar carregar o catálogo novamente</Button>
                </div>
            )}
            {estado.status === "sucesso" && (
                <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="busca-catalogo">Buscar no catálogo</Label>
                            <Input id="busca-catalogo" value={texto} onChange={(event) => onTexto(event.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="grupo-catalogo">Grupo muscular</Label>
                            <select
                                id="grupo-catalogo"
                                className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                                value={grupo}
                                onChange={(event) => onGrupo(event.target.value)}
                            >
                                <option value="TODOS">Todos</option>
                                {grupos.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="modalidade-catalogo">Modalidade do catálogo</Label>
                            <select
                                id="modalidade-catalogo"
                                className="h-10 w-full rounded-md border bg-transparent px-3 text-sm"
                                value={modalidade}
                                onChange={(event) => onModalidade(event.target.value as FiltroModalidade)}
                            >
                                <option value="TODAS">Todas</option>
                                <option value="MUSCULACAO">Musculação</option>
                                <option value="AEROBICO">Aeróbico</option>
                            </select>
                        </div>
                    </div>
                    {total === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum exercício ativo no catálogo.</p>
                    ) : itens.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum exercício encontrado na busca.</p>
                    ) : (
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {itens.map((item) => (
                                <li key={item.id} className="space-y-2 rounded-lg border p-3">
                                    <p className="text-sm font-medium">{item.nome}</p>
                                    <p className="text-xs text-muted-foreground">{item.grupoMuscular} · {ROTULO_TIPO[item.modalidade]}</p>
                                    {onAdicionar && (
                                        <Button type="button" variant="outline" size="sm" onClick={() => onAdicionar(item)}>
                                            Adicionar {item.nome}
                                        </Button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

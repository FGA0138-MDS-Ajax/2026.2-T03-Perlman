import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { adicionarExercicioAoTreino, atualizarExercicioDoTreino, listarExerciciosDoTreino, removerExercicioDoTreino } from "@/lib/api/exercicios-api";
import { atualizarTreino, copiarTreinoPublico, criarTreino, excluirTreino, listarTreinos } from "@/lib/api/treinos-api";
import type { CatalogoExercicioResponseDTO, ExercicioResponseDTO, ModalidadeBackend, TipoTreinoBackend, TreinoResponseDTO, VisibilidadeBackend } from "@/lib/api/contracts";
import { camposVazios, formatarMetaVisivel, lerMeta, paceDosCampos, serializarMeta, validarMeta, type CamposMeta } from "@/lib/meta-exercicio";
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
    modalidade: ModalidadeBackend;
    campos: CamposMeta;
    metaOriginal: string;
    metaRecorde: string;
    persistidoId: number | null;
    removido: boolean;
};

function metaDoItem(item: ExercicioSelecionado): string {
    return serializarMeta(item.campos) ?? "";
}

function validarExerciciosSelecionados(itens: ExercicioSelecionado[], nomeDe: (id: number) => string): string | null {
    for (const item of itens) {
        if (item.removido) continue;
        const erro = validarMeta(item.campos, nomeDe(item.catalogoExercicioId));
        if (erro) return erro;
    }
    return null;
}

function exercicioAlterado(item: ExercicioSelecionado): boolean {
    return item.persistidoId !== null && !item.removido && metaDoItem(item) !== item.metaOriginal;
}

function pedidoDoExercicio(treinoId: number, item: ExercicioSelecionado) {
    return {
        meta: metaDoItem(item),
        metaRecorde: item.metaRecorde.trim() || null,
        treinoId,
        catalogoExercicioId: item.catalogoExercicioId,
    };
}

function confirmarExercicio(item: ExercicioSelecionado, resposta: ExercicioResponseDTO): ExercicioSelecionado {
    return {
        ...item,
        persistidoId: resposta.id,
        campos: lerMeta(item.modalidade, resposta.meta) ?? item.campos,
        metaOriginal: resposta.meta,
        metaRecorde: resposta.metaRecorde ?? "",
        removido: false,
    };
}

async function sincronizarExercicios(
    treinoId: number,
    itens: ExercicioSelecionado[],
    nomeDe: (id: number) => string,
): Promise<{ itens: ExercicioSelecionado[]; erro: string | null }> {
    let atuais = itens.map((item) => ({ ...item }));
    for (const item of atuais.filter(exercicioAlterado)) {
        try {
            const resposta = await atualizarExercicioDoTreino(treinoId, item.persistidoId!, pedidoDoExercicio(treinoId, item));
            atuais = atuais.map((atual) => atual.chave === item.chave ? confirmarExercicio(atual, resposta) : atual);
        } catch (error) {
            return { itens: atuais, erro: `O treino foi salvo, mas não foi possível alterar ${nomeDe(item.catalogoExercicioId)}. ${mensagemAutenticacao(error)}` };
        }
    }
    for (const item of atuais.filter((atual) => atual.removido && atual.persistidoId !== null)) {
        try {
            await removerExercicioDoTreino(treinoId, item.persistidoId!);
            atuais = atuais.filter((atual) => atual.chave !== item.chave);
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                atuais = atuais.filter((atual) => atual.chave !== item.chave);
                continue;
            }
            return { itens: atuais, erro: `O treino foi salvo, mas não foi possível remover ${nomeDe(item.catalogoExercicioId)}. ${mensagemAutenticacao(error)}` };
        }
    }
    for (const item of atuais.filter((atual) => atual.persistidoId === null && !atual.removido)) {
        try {
            const resposta = await adicionarExercicioAoTreino(treinoId, pedidoDoExercicio(treinoId, item));
            atuais = atuais.map((atual) => atual.chave === item.chave ? confirmarExercicio(atual, resposta) : atual);
        } catch (error) {
            return { itens: atuais, erro: `O treino foi salvo, mas não foi possível incluir ${nomeDe(item.catalogoExercicioId)}. ${mensagemAutenticacao(error)}` };
        }
    }
    return { itens: atuais, erro: null };
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
    const [copiandoId, setCopiandoId] = useState<number | null>(null);
    const [erroCopia, setErroCopia] = useState("");
    const [textoCatalogo, setTextoCatalogo] = useState("");
    const [grupoCatalogo, setGrupoCatalogo] = useState("TODOS");
    const [modalidadeCatalogo, setModalidadeCatalogo] = useState<FiltroModalidade>("TODAS");
    const montado = useRef(true);
    const salvando = useRef(false);
    const exclusaoEmAndamento = useRef(false);
    const copiaEmAndamento = useRef(false);
    const formularioRef = useRef<HTMLDivElement>(null);
    const levarAoTreino = useRef(false);
    const location = useLocation();
    const meusTreinosRef = useRef<HTMLDivElement>(null);
    const [aba, setAba] = useState<"conta" | "publicos">("conta");
    const [pedidoRealizar, setPedidoRealizar] = useState<string | null>(null);
    const realizarPedido = Boolean((location.state as { realizar?: boolean } | null)?.realizar);
    if (realizarPedido && pedidoRealizar !== location.key) {
        setPedidoRealizar(location.key);
        setAba("conta");
    }

    useEffect(() => {
        montado.current = true;
        descartarTreinosLocais();
        return () => {
            montado.current = false;
        };
    }, []);

    useEffect(() => {
        if (!levarAoTreino.current || aba !== "conta" || !formularioAberto) return;
        levarAoTreino.current = false;
        formularioRef.current?.scrollIntoView?.({ block: "start" });
    }, [aba, formularioAberto, editando]);

    useEffect(() => {
        if (!realizarPedido || aba !== "conta" || treinos.status !== "sucesso") return;
        meusTreinosRef.current?.scrollIntoView?.({ block: "start" });
    }, [realizarPedido, location.key, aba, treinos.status]);

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
                setSelecionados(lista.map((item) => {
                    const modalidade = itensCatalogo.find((catalogo) => catalogo.id === item.catalogoExercicioId)?.modalidade ?? treino.tipo;
                    return {
                        chave: `salvo-${item.id}`,
                        catalogoExercicioId: item.catalogoExercicioId,
                        modalidade,
                        campos: lerMeta(modalidade, item.meta) ?? camposVazios(modalidade),
                        metaOriginal: item.meta,
                        metaRecorde: item.metaRecorde ?? "",
                        persistidoId: item.id,
                        removido: false,
                    };
                }));
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
            modalidade: item.modalidade,
            campos: camposVazios(item.modalidade),
            metaOriginal: "",
            metaRecorde: "",
            persistidoId: null,
            removido: false,
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
        try {
            const salvo = editando
                ? await atualizarTreino(editando.id, pedido)
                : await criarTreino(pedido);
            if (!montado.current) return;
            publicar(salvo);
            setEditando(salvo);
            const ficha = await sincronizarExercicios(salvo.id, selecionados, nomeDoCatalogo);
            if (!montado.current) return;
            setSelecionados(ficha.itens);
            if (ficha.erro) {
                setErroForm(ficha.erro);
                return;
            }
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

    async function copiarTreino(treino: TreinoResponseDTO) {
        if (copiaEmAndamento.current) return;
        copiaEmAndamento.current = true;
        setCopiandoId(treino.id);
        setErroCopia("");
        try {
            const copia = await copiarTreinoPublico(treino.id);
            if (!montado.current) return;
            publicar(copia);
            levarAoTreino.current = true;
            setAba("conta");
            abrirEdicao(copia);
        } catch (error) {
            if (!montado.current || ignorarConsulta(error)) return;
            setErroCopia(mensagemAutenticacao(error));
        } finally {
            copiaEmAndamento.current = false;
            if (montado.current) setCopiandoId(null);
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
                        <Link to="/treinos" state={{ realizar: true }}><Play className="h-4 w-4" />Realizar treino</Link>
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

                <div className="flex items-center justify-center  bg-background/60 px-6 py-3">
                    <Button
                        type="button"
                        className="rounded-r-none cursor-pointer"
                        variant={aba == "conta" ? "default" : "outline"}
                        onClick={() => setAba("conta")}
                    >
                        Treinos da Conta
                    </Button>

                    <Button
                        type="button"
                        className="rounded-l-none cursor-pointer"
                        variant={aba == "publicos" ? "default" : "outline"}
                        onClick={() => setAba("publicos")}
                    >
                        Treinos da Públicos
                    </Button>
                </div>

                <main className="flex-1 space-y-8 p-6">
                    <section className="mx-auto max-w-5xl space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="font-heading text-lg font-bold">Treinos da conta</h2>
                            <Button onClick={abrirCriacao} disabled={enviando} className="gap-2">
                                <Plus className="h-4 w-4" />Criar treino
                            </Button>
                        </div>

                        {formularioAberto && aba == "conta" && (
                            <Card ref={formularioRef}>
                                <CardHeader>
                                    <CardTitle>{editando ? "Editar treino" : "Novo treino"}</CardTitle>
                                    <CardDescription>
                                        O treino é gravado primeiro. Cada exercício escolhido é associado em seguida, com a meta numérica da modalidade.
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
                                                onCampo={(chave, campo, valor) => setSelecionados((atual) => atual.map((item) => item.chave === chave ? { ...item, campos: { ...item.campos, [campo]: valor } } : item))}
                                                onRemover={(chave) => setSelecionados((atual) => atual.flatMap((item) => {
                                                    if (item.chave !== chave) return [item];
                                                    if (item.persistidoId === null) return [];
                                                    return [{ ...item, removido: true }];
                                                }))}
                                                onDesfazer={(chave) => setSelecionados((atual) => atual.map((item) => item.chave === chave ? { ...item, removido: false } : item))}
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
                        <div className="space-y-6">
                            {erroCopia && <p role="alert" className="text-sm text-destructive">{erroCopia}</p>}
                            {treinos.status === "sucesso" && aba == "conta" && (
                                <div ref={meusTreinosRef} id="meus-treinos">
                                <ListaTreinos
                                    titulo="Meus treinos"
                                    vazio="Nenhum treino criado."
                                    treinos={meusTreinos}
                                    fichas={fichas}
                                    nomeDe={nomeDoCatalogo}
                                    onEditar={abrirEdicao}
                                    onExcluir={(treino) => { setErroExclusao(""); setExclusao(treino); }}
                                />
                                </div>
                            )}

                            {treinos.status === "sucesso" && aba == "publicos" && (
                                <ListaTreinos
                                    titulo="Treinos públicos de outras pessoas"
                                    vazio="Nenhum treino público de outras pessoas."
                                    treinos={treinosPublicos}
                                    fichas={fichas}
                                    nomeDe={nomeDoCatalogo}
                                    onEditar={abrirEdicao}
                                    onExcluir={(treino) => { setErroExclusao(""); setExclusao(treino); }}
                                    onCopiar={(treino) => { void copiarTreino(treino); }}
                                    copiandoId={copiandoId}
                                />
                            )}
                        </div>
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
                <li key={item.id}>{nomeDe(item.catalogoExercicioId)} — {formatarMetaVisivel(item.meta)}</li>
            ))}
        </ul>
    );
}

function ExerciciosSelecionados({
    itens,
    nomeDe,
    onCampo,
    onRemover,
    onDesfazer,
}: {
    itens: ExercicioSelecionado[];
    nomeDe: (id: number) => string;
    onCampo: (chave: string, campo: string, valor: string) => void;
    onRemover: (chave: string) => void;
    onDesfazer: (chave: string) => void;
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
                        const pace = paceDosCampos(item.campos);
                        const metaAnterior = item.metaOriginal && !lerMeta(item.modalidade, item.metaOriginal) ? item.metaOriginal : "";
                        return (
                            <li key={item.chave} className="space-y-2 rounded-lg border p-3">
                                <p className="text-sm font-medium">{nome}</p>
                                {item.removido ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">{nome} será removido ao salvar.</p>
                                        <Button type="button" variant="outline" size="sm" onClick={() => onDesfazer(item.chave)}>Desfazer remoção de {nome}</Button>
                                    </>
                                ) : (
                                    <>
                                        {metaAnterior && <p className="text-xs text-muted-foreground">Meta anterior, em texto: {metaAnterior}</p>}
                                        {item.campos.modalidade === "MUSCULACAO" ? (
                                            <>
                                                <CampoMeta id={`series-${item.chave}`} rotulo={`Séries de ${nome}`} valor={item.campos.series} onChange={(valor) => onCampo(item.chave, "series", valor)} />
                                                <CampoMeta id={`repeticoes-${item.chave}`} rotulo={`Repetições de ${nome}`} valor={item.campos.repeticoes} onChange={(valor) => onCampo(item.chave, "repeticoes", valor)} />
                                                <CampoMeta id={`carga-${item.chave}`} rotulo={`Carga de ${nome} (kg)`} valor={item.campos.cargaKg} onChange={(valor) => onCampo(item.chave, "cargaKg", valor)} />
                                            </>
                                        ) : (
                                            <>
                                                <CampoMeta id={`tempo-${item.chave}`} rotulo={`Tempo de ${nome} (s)`} valor={item.campos.tempoS} onChange={(valor) => onCampo(item.chave, "tempoS", valor)} />
                                                <CampoMeta id={`distancia-${item.chave}`} rotulo={`Distância de ${nome} (m)`} valor={item.campos.distanciaM} onChange={(valor) => onCampo(item.chave, "distanciaM", valor)} />
                                                <p className="text-sm text-muted-foreground">{pace === null ? "O pace aparece quando tempo e distância são positivos." : `Pace: ${pace} s/km`}</p>
                                            </>
                                        )}
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

function CampoMeta({ id, rotulo, valor, onChange }: { id: string; rotulo: string; valor: string; onChange: (valor: string) => void }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{rotulo}</Label>
            <Input id={id} inputMode="decimal" value={valor} onChange={(event) => onChange(event.target.value)} />
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
    onCopiar,
    copiandoId = null,
}: {
    titulo: string;
    vazio: string;
    treinos: TreinoResponseDTO[];
    fichas: Record<number, Consulta<ExercicioResponseDTO[]>>;
    nomeDe: (id: number) => string;
    onEditar: (treino: TreinoResponseDTO) => void;
    onExcluir: (treino: TreinoResponseDTO) => void;
    onCopiar?: (treino: TreinoResponseDTO) => void;
    copiandoId?: number | null;
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
                                    <div className="space-y-2 w-full">
                                        <p className="text-sm text-muted-foreground">Você pode consultar este treino, mas não alterá-lo.</p>
                                        {onCopiar && (
                                            <Button
                                                type="button"
                                                className="h-auto whitespace-normal w-full sm:w-auto"
                                                disabled={copiandoId !== null}
                                                onClick={() => onCopiar(treino)}
                                            >
                                                {copiandoId === treino.id ? "Adicionando…" : "Adicionar aos meus treinos"}
                                            </Button>
                                        )}
                                    </div>
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
                        ? "Escolha um exercício do catálogo e informe a meta numérica no treino. Exercícios pessoais não fazem parte do catálogo."
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

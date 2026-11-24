import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, Plus, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import { amigosDe, listarAmizades, type Amigo } from "@/lib/api/amizades-api";
import {
    aceitarConviteGrupo,
    atualizarGrupo,
    convidarParaGrupo,
    criarGrupo,
    excluirGrupo,
    listarConvitesRecebidos,
    listarFeed,
    listarGrupos,
    listarMembros,
    publicarNoFeed,
    removerMembro,
} from "@/lib/api/grupos-api";
import type { ConviteGrupoRecebidoDTO, ConviteGrupoResponseDTO, GrupoFeedResponseDTO, GrupoMembroResponseDTO, GrupoResponseDTO } from "@/lib/api/contracts";
import { formatarDataTreino } from "@/lib/treinos-apresentacao";
import { linkDeConvite } from "@/lib/grupos-apresentacao";
import Aside from "@/components/aside";
import Header from "@/components/header";

type Consulta<T> = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: T };

function ignorar(error: unknown): boolean {
    return error instanceof ApiError && error.code === "SESSAO_ALTERADA" || error instanceof Error && error.name === "AbortError";
}

export default function PaginaGrupos() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const [params, setParams] = useSearchParams();
    const [menuAberto, setMenuAberto] = useState(false);
    const [consulta, setConsulta] = useState<Consulta<GrupoResponseDTO[]>>({ status: "carregando" });
    const [versao, setVersao] = useState(0);
    const [abertoId, setAbertoId] = useState<number | null>(null);
    const [formulario, setFormulario] = useState<{ aberto: false } | { aberto: true; editando: GrupoResponseDTO | null }>({ aberto: false });
    const [token, setToken] = useState(params.get("convite") ?? "");
    const [erroConvite, setErroConvite] = useState("");
    const [avisoConvite, setAvisoConvite] = useState("");
    const [aceitando, setAceitando] = useState(false);
    const [convites, setConvites] = useState<Consulta<ConviteGrupoRecebidoDTO[]>>({ status: "carregando" });
    const recarregar = useCallback(() => setVersao((valor) => valor + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        listarConvitesRecebidos(controller.signal).then(
            (dados) => setConvites({ status: "sucesso", dados }),
            (error: unknown) => {
                if (controller.signal.aborted || ignorar(error)) return;
                setConvites({ status: "erro", mensagem: mensagemAutenticacao(error) });
            },
        );
        listarGrupos(controller.signal).then(
            (dados) => setConsulta({ status: "sucesso", dados }),
            (error: unknown) => {
                if (controller.signal.aborted || ignorar(error)) return;
                setConsulta({ status: "erro", mensagem: mensagemAutenticacao(error) });
            },
        );
        return () => controller.abort();
    }, [versao]);

    async function aceitar(event: FormEvent) {
        event.preventDefault();
        await aceitarToken(token.trim());
    }

    async function aceitarToken(valor: string) {
        if (aceitando || !valor) return;
        setAceitando(true);
        setErroConvite("");
        setAvisoConvite("");
        try {
            await aceitarConviteGrupo(valor);
            if (valor === token.trim()) setToken("");
            if (params.has("convite")) setParams({}, { replace: true });
            setAvisoConvite("Convite aceito. Você agora faz parte do grupo.");
            recarregar();
        } catch (error) {
            if (!ignorar(error)) setErroConvite(mensagemAutenticacao(error));
        } finally {
            setAceitando(false);
        }
    }

    const grupos = consulta.status === "sucesso" ? consulta.dados : [];
    const aberto = grupos.find((grupo) => grupo.id === abertoId) ?? null;

    return <div className="flex min-h-screen w-full bg-background">
        <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={saindo} />
        <div className="flex min-w-0 flex-1 flex-col">
            <Header email={user?.email ?? ""} menuAberto={menuAberto} setMenuAberto={setMenuAberto}
                title="Grupos" subtitle="Treine em grupo, convide amigos e acompanhe o feed." />
            <main className="min-w-0 flex-1 p-4 sm:p-6">
                <div className="mx-auto max-w-5xl space-y-6">
                    {aberto ? <DetalheGrupo
                        grupo={aberto}
                        onVoltar={() => setAbertoId(null)}
                        onEditar={() => setFormulario({ aberto: true, editando: aberto })}
                        onSaiu={() => { setAbertoId(null); recarregar(); }}
                    /> : <>
                        <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                            <h2 className="font-heading text-lg font-bold">Meus grupos</h2>
                            <Button type="button" className="gap-2" onClick={() => setFormulario({ aberto: true, editando: null })}><Plus className="h-4 w-4" />Criar grupo</Button>
                        </div>

                        {convites.status === "erro" && <p role="alert" className="text-sm text-destructive">{convites.mensagem}</p>}
                        {convites.status === "sucesso" && convites.dados.length > 0 && <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Convites recebidos</CardTitle>
                                <CardDescription>Convites pendentes para participar de grupos.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="divide-y rounded-lg border" aria-label="Convites recebidos">
                                    {convites.dados.map((convite) => <li key={convite.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                                        <span>
                                            <span className="font-medium">{convite.grupoNome}</span>
                                            <span className="block text-xs text-muted-foreground">
                                                {convite.convidanteEmail ? `Convite de ${convite.convidanteEmail} · ` : ""}válido até {formatarDataTreino(convite.expiraEm)}
                                            </span>
                                        </span>
                                        <Button type="button" size="sm" disabled={aceitando} aria-label={`Aceitar convite para ${convite.grupoNome}`}
                                            onClick={() => void aceitarToken(convite.token)}>Aceitar</Button>
                                    </li>)}
                                </ul>
                            </CardContent>
                        </Card>}

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Entrar com convite</CardTitle>
                                <CardDescription>Abra o link recebido ou cole o token do convite.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={(event) => void aceitar(event)} className="flex flex-wrap items-end gap-2">
                                    <div className="min-w-64 flex-1 space-y-1.5">
                                        <Label htmlFor="grupo-token">Token do convite</Label>
                                        <Input id="grupo-token" value={token} autoComplete="off" onChange={(event) => setToken(event.target.value)} />
                                    </div>
                                    <Button type="submit" disabled={aceitando || !token.trim()}>{aceitando ? "Aceitando…" : "Aceitar convite"}</Button>
                                </form>
                                {erroConvite && <p role="alert" className="mt-2 text-sm text-destructive">{erroConvite}</p>}
                                {avisoConvite && <p role="status" className="mt-2 text-sm text-primary">{avisoConvite}</p>}
                            </CardContent>
                        </Card>

                        {consulta.status === "carregando" && <p role="status">Carregando grupos…</p>}
                        {consulta.status === "erro" && <div className="space-y-2">
                            <p role="alert" className="text-sm text-destructive">{consulta.mensagem}</p>
                            <Button type="button" variant="outline" onClick={recarregar}>Tentar carregar grupos novamente</Button>
                        </div>}
                        {consulta.status === "sucesso" && (grupos.length === 0
                            ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Você ainda não participa de nenhum grupo.</CardContent></Card>
                            : <div className="grid gap-4 md:grid-cols-2">
                                {grupos.map((grupo) => <Card key={grupo.id}>
                                    <CardHeader className="space-y-2">
                                        <Badge variant={grupo.papel === "ADMIN" ? "default" : "outline"} className="w-fit">{grupo.papel === "ADMIN" ? "Administrador" : "Membro"}</Badge>
                                        <CardTitle className="text-lg">{grupo.nome}</CardTitle>
                                        {grupo.descricao && <CardDescription className="line-clamp-2">{grupo.descricao}</CardDescription>}
                                    </CardHeader>
                                    <CardContent>
                                        <Button type="button" size="sm" aria-label={`Abrir ${grupo.nome}`} onClick={() => setAbertoId(grupo.id)}>Abrir grupo</Button>
                                    </CardContent>
                                </Card>)}
                            </div>)}
                    </>}
                </div>
            </main>
        </div>
        <Dialog open={formulario.aberto} onOpenChange={(valor) => { if (!valor) setFormulario({ aberto: false }); }}>
            <DialogContent className="sm:max-w-lg">
                {formulario.aberto && <FormularioGrupo editando={formulario.editando}
                    onCancelar={() => setFormulario({ aberto: false })}
                    onSalvo={(grupo) => { setFormulario({ aberto: false }); setAbertoId(grupo.id); recarregar(); }} />}
            </DialogContent>
        </Dialog>
    </div>;
}

function FormularioGrupo({ editando, onCancelar, onSalvo }: {
    editando: GrupoResponseDTO | null;
    onCancelar: () => void;
    onSalvo: (grupo: GrupoResponseDTO) => void;
}) {
    const [nome, setNome] = useState(editando?.nome ?? "");
    const [descricao, setDescricao] = useState(editando?.descricao ?? "");
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function salvar(event: FormEvent) {
        event.preventDefault();
        if (enviando) return;
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) { setErro("Informe o nome do grupo."); return; }
        if (nomeLimpo.length > 100) { setErro("O nome deve ter no máximo 100 caracteres."); return; }
        if (descricao.trim().length > 1000) { setErro("A descrição deve ter no máximo 1000 caracteres."); return; }
        setEnviando(true);
        setErro("");
        const pedido = { nome: nomeLimpo, ...(descricao.trim() ? { descricao: descricao.trim() } : {}) };
        try {
            onSalvo(editando ? await atualizarGrupo(editando.id, pedido) : await criarGrupo(pedido));
        } catch (error) {
            if (!ignorar(error)) setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    return <form className="space-y-4" onSubmit={(event) => void salvar(event)} aria-busy={enviando}>
        <DialogHeader>
            <DialogTitle>{editando ? "Editar grupo" : "Novo grupo"}</DialogTitle>
            <DialogDescription>Quem cria o grupo se torna administrador.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5"><Label htmlFor="grupo-nome">Nome</Label><Input id="grupo-nome" value={nome} maxLength={100} onChange={(event) => setNome(event.target.value)} /></div>
        <div className="space-y-1.5">
            <Label htmlFor="grupo-descricao">Descrição (opcional)</Label>
            <textarea id="grupo-descricao" rows={3} maxLength={1000} value={descricao} className="w-full rounded-md border bg-background px-3 py-2 text-sm" onChange={(event) => setDescricao(event.target.value)} />
        </div>
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancelar} disabled={enviando}>Cancelar</Button>
            <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : editando ? "Salvar alterações" : "Criar grupo"}</Button>
        </DialogFooter>
    </form>;
}

function DetalheGrupo({ grupo, onVoltar, onEditar, onSaiu }: {
    grupo: GrupoResponseDTO;
    onVoltar: () => void;
    onEditar: () => void;
    onSaiu: () => void;
}) {
    const { user } = useAuth();
    const usuarioId = Number(user?.id);
    const souAdmin = grupo.papel === "ADMIN";
    const [membros, setMembros] = useState<Consulta<GrupoMembroResponseDTO[]>>({ status: "carregando" });
    const [feed, setFeed] = useState<Consulta<GrupoFeedResponseDTO[]>>({ status: "carregando" });
    const [amigos, setAmigos] = useState<Amigo[]>([]);
    const [versao, setVersao] = useState(0);
    const [convidadoId, setConvidadoId] = useState("");
    const [convite, setConvite] = useState<ConviteGrupoResponseDTO | null>(null);
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [confirmar, setConfirmar] = useState<null | "excluir" | "sair">(null);
    const [publicacao, setPublicacao] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        listarMembros(grupo.id, signal).then((dados) => setMembros({ status: "sucesso", dados }),
            (error: unknown) => { if (!signal.aborted && !ignorar(error)) setMembros({ status: "erro", mensagem: mensagemAutenticacao(error) }); });
        listarFeed(grupo.id, signal).then((dados) => setFeed({ status: "sucesso", dados }),
            (error: unknown) => { if (!signal.aborted && !ignorar(error)) setFeed({ status: "erro", mensagem: mensagemAutenticacao(error) }); });
        if (souAdmin) listarAmizades(signal).then((dados) => setAmigos(amigosDe(dados, usuarioId)), () => setAmigos([]));
        return () => controller.abort();
    }, [grupo.id, souAdmin, usuarioId, versao]);

    async function executar(acao: () => Promise<unknown>, sucesso: string, depois?: () => void) {
        if (enviando) return;
        setEnviando(true);
        setErro("");
        setAviso("");
        try {
            await acao();
            setAviso(sucesso);
            if (depois) depois(); else setVersao((valor) => valor + 1);
        } catch (error) {
            if (!ignorar(error)) setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    const emailDe = (id: number) => membros.status === "sucesso"
        ? membros.dados.find((membro) => membro.usuarioId === id)?.email ?? `Usuário ${id}` : `Usuário ${id}`;
    const membrosIds = new Set(membros.status === "sucesso" ? membros.dados.map((membro) => membro.usuarioId) : []);
    const convidaveis = amigos.filter((amigo) => !membrosIds.has(amigo.usuarioId));

    return <div className="space-y-4">
        <Button type="button" variant="ghost" className="gap-1.5" onClick={onVoltar}><ChevronLeft className="h-4 w-4" />Voltar para os grupos</Button>
        <Card>
            <CardHeader className="space-y-2">
                <Badge variant={souAdmin ? "default" : "outline"} className="w-fit">{souAdmin ? "Você é administrador" : "Membro"}</Badge>
                <h2 className="text-xl font-semibold leading-none tracking-tight">{grupo.nome}</h2>
                {grupo.descricao && <CardDescription>{grupo.descricao}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
                <section aria-labelledby="grupo-membros" className="space-y-2">
                    <h3 id="grupo-membros" className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" />Membros</h3>
                    {membros.status === "carregando" && <p role="status" className="text-sm">Carregando membros…</p>}
                    {membros.status === "erro" && <p role="alert" className="text-sm text-destructive">{membros.mensagem}</p>}
                    {membros.status === "sucesso" && <ul className="divide-y rounded-lg border">
                        {membros.dados.map((membro) => <li key={membro.usuarioId} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                            <span className="flex items-center gap-2 break-all">{membro.email}
                                {membro.papel === "ADMIN" && <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />Admin</Badge>}</span>
                            {souAdmin && membro.usuarioId !== usuarioId && <Button type="button" size="sm" variant="outline" disabled={enviando}
                                aria-label={`Remover ${membro.email}`}
                                onClick={() => void executar(() => removerMembro(grupo.id, membro.usuarioId), "Membro removido.")}>Remover</Button>}
                        </li>)}
                    </ul>}
                </section>

                {souAdmin && <section aria-labelledby="grupo-convidar" className="space-y-2">
                    <h3 id="grupo-convidar" className="font-semibold">Convidar amigo</h3>
                    {convidaveis.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum amigo disponível para convite. Adicione amigos na página Amigos.</p>
                        : <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => {
                            event.preventDefault();
                            if (!convidadoId) return;
                            void executar(async () => { setConvite(await convidarParaGrupo(grupo.id, Number(convidadoId))); setConvidadoId(""); },
                                "Convite criado. Envie o link abaixo para seu amigo.");
                        }}>
                            <div className="space-y-1.5">
                                <Label htmlFor="grupo-amigo">Amigo</Label>
                                <select id="grupo-amigo" className="h-9 min-w-56 rounded-md border bg-background px-2 text-sm" value={convidadoId} onChange={(event) => setConvidadoId(event.target.value)}>
                                    <option value="">Selecione</option>
                                    {convidaveis.map((amigo) => <option key={amigo.usuarioId} value={amigo.usuarioId}>{amigo.email}</option>)}
                                </select>
                            </div>
                            <Button type="submit" disabled={enviando || !convidadoId}>Gerar convite</Button>
                        </form>}
                    {convite && <div className="space-y-1 rounded-lg border p-3 text-xs">
                        <p><strong>Link:</strong> <code className="break-all">{linkDeConvite(convite.token)}</code></p>
                        <p className="text-muted-foreground">Válido até {formatarDataTreino(convite.expiraEm)}. Somente a pessoa convidada consegue aceitá-lo.</p>
                        <Button type="button" size="sm" variant="outline" onClick={() => void navigator.clipboard?.writeText(linkDeConvite(convite.token)).then(() => setAviso("Link copiado."), () => setErro("Não foi possível copiar o link."))}>Copiar link</Button>
                    </div>}
                </section>}

                <section aria-labelledby="grupo-feed" className="space-y-2">
                    <h3 id="grupo-feed" className="font-semibold">Feed</h3>
                    <form className="space-y-2" onSubmit={(event) => {
                        event.preventDefault();
                        const conteudo = publicacao.trim();
                        if (!conteudo) return;
                        void executar(() => publicarNoFeed(grupo.id, conteudo), "Publicação enviada.", () => {
                            setPublicacao("");
                            setVersao((valor) => valor + 1);
                        });
                    }}>
                        <Label htmlFor="grupo-publicacao" className="sr-only">Nova publicação</Label>
                        <textarea id="grupo-publicacao" rows={2} maxLength={1000} placeholder="Compartilhe algo com o grupo"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={publicacao} onChange={(event) => setPublicacao(event.target.value)} />
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">{publicacao.length}/1000</span>
                            <Button type="submit" size="sm" disabled={enviando || !publicacao.trim()}>Publicar</Button>
                        </div>
                    </form>
                    {feed.status === "carregando" && <p role="status" className="text-sm">Carregando feed…</p>}
                    {feed.status === "erro" && <p role="alert" className="text-sm text-destructive">{feed.mensagem}</p>}
                    {feed.status === "sucesso" && (feed.dados.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
                        : <ul className="space-y-2">
                            {feed.dados.map((post) => <li key={post.id} className="rounded-lg border p-3 text-sm">
                                <p className="text-xs text-muted-foreground">{emailDe(post.usuarioId)} · {formatarDataTreino(post.criadoEm)}</p>
                                <p className="mt-1 whitespace-pre-wrap">{post.conteudo}</p>
                            </li>)}
                        </ul>)}
                </section>

                {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                {aviso && <p role="status" className="text-sm text-primary">{aviso}</p>}

                <div className="flex flex-wrap gap-2">
                    {souAdmin && <Button type="button" variant="outline" onClick={onEditar}>Editar grupo</Button>}
                    <Button type="button" variant="outline" onClick={() => setConfirmar("sair")}>Sair do grupo</Button>
                    {souAdmin && <Button type="button" variant="outline" className="text-destructive" onClick={() => setConfirmar("excluir")}>Excluir grupo</Button>}
                </div>
            </CardContent>
        </Card>

        <Dialog open={confirmar !== null} onOpenChange={(valor) => { if (!valor) setConfirmar(null); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{confirmar === "excluir" ? "Excluir grupo" : "Sair do grupo"}</DialogTitle>
                    <DialogDescription>{confirmar === "excluir"
                        ? `O grupo "${grupo.nome}" será excluído para todos os membros.`
                        : `Você deixará de participar de "${grupo.nome}".`}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setConfirmar(null)}>Voltar</Button>
                    <Button type="button" variant="destructive" disabled={enviando} onClick={() => {
                        const acao = confirmar;
                        setConfirmar(null);
                        void executar(() => acao === "excluir" ? excluirGrupo(grupo.id) : removerMembro(grupo.id, usuarioId),
                            acao === "excluir" ? "Grupo excluído." : "Você saiu do grupo.", onSaiu);
                    }}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>;
}

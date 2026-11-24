import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Check, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import {
    enviarSolicitacao,
    listarAmizades,
    removerAmizade,
    responderSolicitacao,
} from "@/lib/api/amizades-api";
import type { AmizadeResponseDTO } from "@/lib/api/contracts";
import Aside from "@/components/aside";
import Header from "@/components/header";

type Consulta = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: AmizadeResponseDTO[] };

function ignorar(error: unknown): boolean {
    return error instanceof ApiError && error.code === "SESSAO_ALTERADA" || error instanceof Error && error.name === "AbortError";
}

function Secao({ titulo, descricao, vazio, itens, acoes }: {
    titulo: string;
    descricao: string;
    vazio: string;
    itens: { id: number; email: string }[];
    acoes: (id: number, email: string) => ReactNode;
}) {
    return <Card>
        <CardHeader><CardTitle className="text-lg">{titulo}</CardTitle><CardDescription>{descricao}</CardDescription></CardHeader>
        <CardContent>
            {itens.length === 0 ? <p className="text-sm text-muted-foreground">{vazio}</p> : <ul className="divide-y rounded-lg border" aria-label={titulo}>
                {itens.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                    <span className="break-all">{item.email}</span>
                    <div className="flex gap-2">{acoes(item.id, item.email)}</div>
                </li>)}
            </ul>}
        </CardContent>
    </Card>;
}

export default function PaginaAmigos() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const usuarioId = Number(user?.id);
    const [menuAberto, setMenuAberto] = useState(false);
    const [consulta, setConsulta] = useState<Consulta>({ status: "carregando" });
    const [versao, setVersao] = useState(0);
    const [destinatario, setDestinatario] = useState("");
    const [erro, setErro] = useState("");
    const [aviso, setAviso] = useState("");
    const [operando, setOperando] = useState<number | "envio" | null>(null);
    const recarregar = useCallback(() => setVersao((valor) => valor + 1), []);

    useEffect(() => {
        const controller = new AbortController();
        listarAmizades(controller.signal).then(
            (dados) => setConsulta({ status: "sucesso", dados }),
            (error: unknown) => {
                if (controller.signal.aborted || ignorar(error)) return;
                setConsulta({ status: "erro", mensagem: mensagemAutenticacao(error) });
            },
        );
        return () => controller.abort();
    }, [versao]);

    async function executar(chave: number | "envio", acao: () => Promise<unknown>, sucesso: string) {
        if (operando !== null) return;
        setOperando(chave);
        setErro("");
        setAviso("");
        try {
            await acao();
            setAviso(sucesso);
            recarregar();
        } catch (error) {
            if (!ignorar(error)) setErro(mensagemAutenticacao(error));
        } finally {
            setOperando(null);
        }
    }

    function enviar(event: FormEvent) {
        event.preventDefault();
        const id = Number(destinatario.trim());
        if (!Number.isSafeInteger(id) || id <= 0) {
            setErro("Informe o ID numérico da conta do seu amigo.");
            return;
        }
        if (id === usuarioId) {
            setErro("Você não pode enviar uma solicitação para si mesmo.");
            return;
        }
        void executar("envio", async () => { await enviarSolicitacao(id); setDestinatario(""); }, "Solicitação enviada.");
    }

    const amizades = consulta.status === "sucesso" ? consulta.dados : [];
    const outro = (item: AmizadeResponseDTO) => item.solicitanteId === usuarioId
        ? item.destinatarioEmail : item.solicitanteEmail;
    const amigos = amizades.filter((item) => item.estado === "ACEITA").map((item) => ({ id: item.id, email: outro(item) }));
    const recebidas = amizades.filter((item) => item.estado === "PENDENTE" && item.destinatarioId === usuarioId)
        .map((item) => ({ id: item.id, email: item.solicitanteEmail }));
    const enviadas = amizades.filter((item) => item.estado === "PENDENTE" && item.solicitanteId === usuarioId)
        .map((item) => ({ id: item.id, email: item.destinatarioEmail }));

    return <div className="flex min-h-screen w-full bg-background">
        <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={saindo} />
        <div className="flex min-w-0 flex-1 flex-col">
            <Header email={user?.email ?? ""} menuAberto={menuAberto} setMenuAberto={setMenuAberto}
                title="Amigos" subtitle="Envie e responda solicitações de amizade." />
            <main className="min-w-0 flex-1 p-4 sm:p-6">
                <div className="mx-auto max-w-3xl space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Adicionar amigo</CardTitle>
                            <CardDescription>Informe o ID da conta do seu amigo (ele encontra o número em "Minha conta"). Seu ID é {user?.id}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={enviar} className="flex flex-wrap items-end gap-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="amigo-id">ID da conta</Label>
                                    <Input id="amigo-id" inputMode="numeric" value={destinatario} onChange={(event) => setDestinatario(event.target.value)} className="w-40" />
                                </div>
                                <Button type="submit" className="gap-1.5" disabled={operando !== null || !destinatario.trim()}>
                                    <UserPlus className="h-4 w-4" />{operando === "envio" ? "Enviando…" : "Enviar solicitação"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                    {aviso && <p role="status" className="text-sm text-primary">{aviso}</p>}

                    {consulta.status === "carregando" && <p role="status">Carregando amizades…</p>}
                    {consulta.status === "erro" && <div className="space-y-2">
                        <p role="alert" className="text-sm text-destructive">{consulta.mensagem}</p>
                        <Button type="button" variant="outline" onClick={recarregar}>Tentar carregar amizades novamente</Button>
                    </div>}
                    {consulta.status === "sucesso" && <>
                        <Secao titulo="Solicitações recebidas" descricao="Pessoas que querem ser suas amigas." vazio="Nenhuma solicitação pendente."
                            itens={recebidas} acoes={(id, email) => <>
                                <Button type="button" size="sm" className="gap-1" aria-label={`Aceitar ${email}`} disabled={operando !== null}
                                    onClick={() => void executar(id, () => responderSolicitacao(id, "ACEITA"), "Solicitação aceita.")}><Check className="h-4 w-4" />Aceitar</Button>
                                <Button type="button" size="sm" variant="outline" className="gap-1" aria-label={`Recusar ${email}`} disabled={operando !== null}
                                    onClick={() => void executar(id, () => responderSolicitacao(id, "RECUSADA"), "Solicitação recusada.")}><X className="h-4 w-4" />Recusar</Button>
                            </>} />
                        <Secao titulo="Amigos" descricao="Você pode convidá-los para desafios e grupos." vazio="Você ainda não tem amigos adicionados."
                            itens={amigos} acoes={(id, email) => (
                                <Button type="button" size="sm" variant="outline" className="gap-1 text-destructive" aria-label={`Desfazer amizade com ${email}`} disabled={operando !== null}
                                    onClick={() => void executar(id, () => removerAmizade(id), "Amizade desfeita.")}><UserMinus className="h-4 w-4" />Desfazer</Button>
                            )} />
                        <Secao titulo="Solicitações enviadas" descricao="Aguardando resposta." vazio="Nenhuma solicitação enviada pendente."
                            itens={enviadas} acoes={(id, email) => (
                                <Button type="button" size="sm" variant="outline" aria-label={`Cancelar solicitação para ${email}`} disabled={operando !== null}
                                    onClick={() => void executar(id, () => removerAmizade(id), "Solicitação cancelada.")}>Cancelar</Button>
                            )} />
                    </>}
                </div>
            </main>
        </div>
    </div>;
}

import { useCallback, useEffect, useState } from "react";
import Aside from "@/components/aside";
import Header from "@/components/header";
import AceitarConviteAdmin from "@/components/aceitar-convite-admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, mensagemAutenticacao } from "@/lib/auth-context";
import { buscarConta, excluirConta } from "@/lib/api/conta-api";
import type { UsuarioResponseDTO } from "@/lib/api/contracts";
import { ApiError } from "@/lib/api/http-client";

const ROTULO_PERFIL = { USUARIO: "Usuário", ADMINISTRADOR: "Administrador", SUPERUSUARIO: "Superusuário" } as const;

export default function PaginaConta() {
    const { user, logout, isAdmin, enviando } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState("");
    const [conta, setConta] = useState<UsuarioResponseDTO | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erroConsulta, setErroConsulta] = useState("");
    const usuarioId = user?.id;

    const consultarDados = useCallback(async (signal?: AbortSignal) => {
        if (!usuarioId) return;
        setCarregando(true);
        setErroConsulta("");
        try {
            const dados = await buscarConta(Number(usuarioId), signal);
            if (!signal?.aborted) setConta(dados);
        } catch (error) {
            if (signal?.aborted || error instanceof ApiError && error.code === "SESSAO_ALTERADA") return;
            setErroConsulta(mensagemAutenticacao(error));
        } finally {
            if (!signal?.aborted) setCarregando(false);
        }
    }, [usuarioId]);

    useEffect(() => {
        const controller = new AbortController();
        void consultarDados(controller.signal);
        return () => controller.abort();
    }, [consultarDados]);

    async function confirmarExclusao() {
        if (!user) return;
        setExcluindo(true);
        setErro("");
        try {
            await excluirConta(Number(user.id));
            await logout();
        } catch (error) {
            setErro(mensagemAutenticacao(error));
        } finally {
            setExcluindo(false);
            setConfirmando(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={enviando} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header email={user?.email || ""} menuAberto={menuAberto} setMenuAberto={setMenuAberto} title="Minha conta" subtitle="Dados e gerenciamento da conta." />
                <main className="min-w-0 flex-1 space-y-4 p-4 sm:p-6">
                    <Card className="max-w-2xl">
                        <CardHeader><CardTitle>Dados da conta</CardTitle><CardDescription>Informações vinculadas ao usuário autenticado.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            {carregando && !conta && <p role="status" className="text-sm text-muted-foreground">Carregando dados da conta…</p>}
                            {erroConsulta && <p role="alert" className="text-sm text-destructive">{erroConsulta}</p>}
                            {conta && <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div><dt className="text-muted-foreground">ID da conta</dt><dd className="font-medium">{conta.id}</dd>
                                    <p className="mt-1 text-xs text-muted-foreground">Compartilhe este número para receber pedidos de amizade.</p></div>
                                <div><dt className="text-muted-foreground">E-mail</dt><dd className="font-medium">{conta.email}</dd></div>
                                <div><dt className="text-muted-foreground">Perfil</dt><dd className="font-medium">{ROTULO_PERFIL[conta.perfil]}</dd></div>
                                <div><dt className="text-muted-foreground">Situação</dt><dd className="font-medium">{conta.ativo ? "Ativa" : "Inativa"}</dd></div>
                            </dl>}
                            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" disabled={carregando} onClick={() => void consultarDados()}>{carregando ? "Atualizando…" : "Atualizar dados"}</Button>
                                <Button type="button" variant="destructive" onClick={() => setConfirmando(true)}>Excluir conta</Button>
                            </div>
                        </CardContent>
                    </Card>
                    {user?.perfil === "USUARIO" && <AceitarConviteAdmin />}
                </main>
            </div>
            <Dialog open={confirmando} onOpenChange={setConfirmando}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Excluir conta</DialogTitle><DialogDescription>Esta ação é permanente e remove seus dados da plataforma.</DialogDescription></DialogHeader>
                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setConfirmando(false)} disabled={excluindo}>Cancelar</Button>
                        <Button type="button" variant="destructive" onClick={() => void confirmarExclusao()} disabled={excluindo}>{excluindo ? "Excluindo…" : "Confirmar exclusão"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

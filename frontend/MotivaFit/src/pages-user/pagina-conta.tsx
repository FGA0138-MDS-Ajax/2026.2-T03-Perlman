import { useState } from "react";
import Aside from "@/components/aside";
import Header from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth, mensagemAutenticacao } from "@/lib/auth-context";
import { buscarConta, excluirConta } from "@/lib/api/conta-api";

export default function PaginaConta() {
    const { user, logout, isAdmin, enviando } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const [confirmando, setConfirmando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState("");

    async function consultarDados() {
        if (!user) return;
        await buscarConta(Number(user.id));
    }

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
                <main className="min-w-0 flex-1 p-4 sm:p-6">
                    <Card className="max-w-2xl">
                        <CardHeader><CardTitle>Dados da conta</CardTitle><CardDescription>Informações vinculadas ao usuário autenticado.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                <div><dt className="text-muted-foreground">E-mail</dt><dd className="font-medium">{user?.email}</dd></div>
                                <div><dt className="text-muted-foreground">Perfil</dt><dd className="font-medium">{user?.perfil}</dd></div>
                            </dl>
                            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                            <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="outline" onClick={() => void consultarDados()}>Atualizar dados</Button>
                                <Button type="button" variant="destructive" onClick={() => setConfirmando(true)}>Excluir conta</Button>
                            </div>
                        </CardContent>
                    </Card>
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

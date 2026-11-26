import AdminLayout from "@/components/admin-layout";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, mensagemAutenticacao } from "@/lib/auth-context";
import { criarConvite, type ConviteCriado } from "@/lib/api/admin-api";

export default function PaginaSuperUsuario() {
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [convite, setConvite] = useState<ConviteCriado | null>(null);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function emitir() {
        if (!user) return;
        setErro(""); setSucesso(""); setEnviando(true);
        try {
            const criado = await criarConvite({ convidadorId: Number(user.id), email: email.trim().toLowerCase() });
            setConvite(criado);
            setSucesso("Convite criado com sucesso.");
        } catch (error) {
            setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    return <AdminLayout title="SuperUsuário">
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Criar convite</CardTitle>
                <CardDescription>Gera um convite válido por sete dias. Envie o token à pessoa convidada: ela o informa em "Minha conta".</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1.5"><Label htmlFor="convite-email">E-mail do usuário</Label><Input id="convite-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
                <Button type="button" onClick={() => void emitir()} disabled={enviando || !email.trim()}>{enviando ? "Criando…" : "Criar convite"}</Button>
                {convite && <div className="rounded-lg border p-3 text-xs"><p><strong>Token:</strong> <code className="break-all">{convite.token}</code></p><p className="mt-1 text-muted-foreground">Expira em {new Date(convite.expiraEm).toLocaleString("pt-BR")}</p></div>}
            </CardContent>
        </Card>
        {erro && <p role="alert" className="mt-4 text-sm text-destructive">{erro}</p>}
        {sucesso && <p role="status" className="mt-4 text-sm text-primary">{sucesso}</p>}
    </AdminLayout>;
}

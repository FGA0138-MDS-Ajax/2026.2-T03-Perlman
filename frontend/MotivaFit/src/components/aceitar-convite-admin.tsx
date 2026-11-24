import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { aceitarConvite } from "@/lib/api/admin-api";
import { refreshSession } from "@/lib/api/http-client";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";

/** Permite que a conta autenticada aceite um convite de administrador recebido. */
export default function AceitarConviteAdmin() {
    const { user } = useAuth();
    const [token, setToken] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    async function aceitar() {
        if (!user || enviando) return;
        setErro(""); setSucesso(""); setEnviando(true);
        try {
            await aceitarConvite({ usuarioId: Number(user.id), token: token.trim() });
            setToken("");
            // O perfil vem do JWT: renova a sessão para refletir a promoção imediatamente.
            try {
                await refreshSession();
                setSucesso("Convite aceito. Seu perfil foi atualizado.");
            } catch {
                setSucesso("Convite aceito. Entre novamente para atualizar seu perfil.");
            }
        } catch (error) {
            setErro(mensagemAutenticacao(error));
        } finally {
            setEnviando(false);
        }
    }

    return <Card className="max-w-2xl">
        <CardHeader>
            <CardTitle>Convite de administrador</CardTitle>
            <CardDescription>Se você recebeu um token de convite, informe-o para promover sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="convite-admin-token">Token do convite</Label>
                <Input id="convite-admin-token" value={token} autoComplete="off" onChange={(event) => setToken(event.target.value)} />
            </div>
            <Button type="button" variant="outline" onClick={() => void aceitar()} disabled={enviando || !token.trim()}>
                {enviando ? "Aceitando…" : "Aceitar convite"}
            </Button>
            {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
            {sucesso && <p role="status" className="text-sm text-primary">{sucesso}</p>}
        </CardContent>
    </Card>;
}

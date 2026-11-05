import { useState, type FormEvent } from "react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

export default function PaginaSuperUsuario() {
    const { admins, adicionarAdmin } = useAuth();
    const [emailNovoAdmin, setEmailNovoAdmin] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState(false);

    function handleAdicionarAdmin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const email = emailNovoAdmin.trim().toLowerCase();
        if (!email) return;

        if (admins.some((admin) => admin.toLowerCase() === email)) {
            setErro(true);
            setMensagem("Este e-mail já está cadastrado como administrador.");
            return;
        }

        adicionarAdmin(email);
        setEmailNovoAdmin("");
        setErro(false);
        setMensagem("Administrador cadastrado com sucesso.");
    }

    return (
        <AdminLayout title="SuperUsuário">
            <Card>
                <CardHeader>
                    <CardTitle>Cadastrar administrador</CardTitle>
                    <CardDescription>
                        Informe o e-mail que será autorizado a acessar o painel administrativo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="max-w-lg">
                    <form onSubmit={handleAdicionarAdmin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-novo-admin">E-mail do administrador</Label>
                            <Input
                                id="email-novo-admin"
                                type="email"
                                placeholder="nome@exemplo.com"
                                value={emailNovoAdmin}
                                onChange={(event) => {
                                    setEmailNovoAdmin(event.target.value);
                                    setMensagem("");
                                }}
                                required
                            />
                        </div>
                        <Button type="submit">Cadastrar admin</Button>
                        {mensagem && (
                            <p
                                role="status"
                                className={`text-sm ${
                                    erro ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                                }`}
                            >
                                {mensagem}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Administradores cadastrados</CardTitle>
                    <CardDescription>
                        E-mails autorizados como administradores no MotivaFit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {admins.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum administrador cadastrado.</p>
                    ) : (
                        <ul className="space-y-2">
                            {admins.map((email) => (
                                <li key={email} className="rounded-md border px-3 py-2 text-sm">
                                    {email}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}

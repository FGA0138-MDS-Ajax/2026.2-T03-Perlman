import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, ArrowLeft, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, isEmailAdmin } from "@/lib/auth-context";

export default function PaginaLogin() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { login, admins } = useAuth();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;

        login(email, senha);

        const eAdmin = isEmailAdmin(email, admins);
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

        if (from && (from !== "/admin" || eAdmin)) {
            navigate(from, { replace: true });
        } else if (eAdmin) {
            navigate("/admin", { replace: true });
        } else {
            navigate("/principal", { replace: true });
        }
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                <ThemeToggle variant="outline" className="h-9 w-9" />
            </div>

            <Link
                to="/"
                className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Voltar para o início
            </Link>

            <Card className="w-full max-w-md shadow-lg border-border/80">
                <CardHeader className="text-center space-y-2 pb-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
                        <Dumbbell className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-heading font-bold">Bem-vindo de volta</CardTitle>
                    <CardDescription className="text-sm">
                        Entre na sua conta para continuar seus treinos
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="senha">Senha</Label>
                                <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                    Esqueceu a senha?
                                </a>
                            </div>
                            <Input
                                id="senha"
                                type="password"
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/40 space-y-1">
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                                <span>Controle de Acesso:</span>
                            </div>
                            <p>
                                Administradores cadastrados (<code className="font-mono text-primary">admin@motivafit.com</code>) têm acesso ao Painel Admin. Demais e-mails acessam o Painel do Aluno.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button type="submit" className="w-full h-11 font-medium shadow-sm">
                            Entrar na conta
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Ainda não tem conta?{" "}
                            <Link to="/cadastro" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Cadastre-se gratuitamente
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

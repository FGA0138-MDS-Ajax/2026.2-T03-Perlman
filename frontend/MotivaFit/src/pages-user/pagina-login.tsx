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
import { Link, useLocation } from "react-router-dom";
import { Dumbbell, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, mensagemAutenticacao } from "@/lib/auth-context";

export default function PaginaLogin() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const location = useLocation();
    const { login, enviando, limparAviso } = useAuth();
    const [erro, setErro] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (enviando) return;
        setErro("");
        limparAviso();
        try { await login(email, senha); }
        catch (error) { setErro(mensagemAutenticacao(error)); }
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

                <form onSubmit={handleSubmit} aria-busy={enviando}>
                    <fieldset disabled={enviando}>
                    <CardContent className="space-y-4">
                        {location.state?.cadastroConcluido && <p role="status" className="text-sm">Conta criada. Entre com seu e-mail e senha.</p>}
                        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                autoComplete="username"
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
                                <span className="text-xs text-muted-foreground">Recuperação de senha em breve</span>
                            </div>
                            <div className="relative">
                            <Input
                                id="senha"
                                autoComplete="current-password"
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="••••••••"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                                tabIndex={-1}
                            >
                                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            </div>
                        </div>

                       
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button type="submit" className="w-full h-11 font-medium shadow-sm">
                            {enviando ? "Entrando…" : "Entrar na conta"}
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 font-medium gap-3"
                            disabled={enviando}
                            onClick={() => {
                                // TODO: integrar com backend OAuth do Google futuramente
                                alert("Login com Google será implementado em breve!");
                            }}
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Entrar com Google
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Ainda não tem conta?{" "}
                            <Link to="/cadastro" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Cadastre-se gratuitamente
                            </Link>
                        </p>
                        <p className="text-center text-xs text-muted-foreground">
                            Ao utilizar o MotivaFit, você concorda com nossos{" "}
                            <Link to="/termos-de-uso" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Termos de Uso e Política de Privacidade
                            </Link>.
                        </p>
                    </CardFooter>
                    </fieldset>
                </form>
            </Card>
        </div>
    );
}

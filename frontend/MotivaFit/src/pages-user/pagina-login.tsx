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

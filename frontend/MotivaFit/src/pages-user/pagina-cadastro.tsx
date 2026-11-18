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
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell, ArrowLeft, AlertCircle, Eye, EyeOff } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, mensagemAutenticacao } from "@/lib/auth-context";

export default function PaginaCadastro() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const navigate = useNavigate();
    const { cadastro, enviando, limparAviso } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (enviando) return;
        setErro("");
        limparAviso();

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (!/^(?=.*\p{Lu})(?=.*\p{Ll})(?=.*\d)(?=.*[^\p{L}\d\s]).{6,}$/u.test(senha)) {
            setErro("A senha deve ter pelo menos 6 caracteres, incluindo maiúscula, minúscula, número e símbolo.");
            return;
        }

        try {
            await cadastro(email, senha);
            navigate("/login", { replace: true, state: { cadastroConcluido: true } });
        } catch (error) { setErro(mensagemAutenticacao(error)); }

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
                    <CardTitle className="text-2xl font-heading font-bold">Criar Conta</CardTitle>
                    <CardDescription className="text-sm">
                        Cadastre-se no MotivaFit e comece a transformar seus treinos
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} aria-busy={enviando}>
                    <fieldset disabled={enviando}>
                    <CardContent className="space-y-4">
                        {erro && (
                            <div role="alert" className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{erro}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                autoComplete="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <p id="regras-senha" className="text-xs text-muted-foreground">Use 6 ou mais caracteres, com maiúscula, minúscula, número e símbolo.</p>
                            <div className="relative">
                            <Input
                                id="senha"
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Mínimo de 6 caracteres"
                                aria-describedby="regras-senha"
                                minLength={6}
                                autoComplete="new-password"
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmar-senha">Confirmar senha</Label>
                            <div className="relative">
                            <Input
                                id="confirmar-senha"
                                autoComplete="new-password"
                                type={mostrarConfirmarSenha ? "text" : "password"}
                                placeholder="Repita sua senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
                                tabIndex={-1}
                            >
                                {mostrarConfirmarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            </div>
                        </div>

                        
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button type="submit" className="w-full h-11 font-medium shadow-sm">
                            {enviando ? "Criando conta…" : "Criar minha conta"}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            Ao criar sua conta, você concorda com nossos{" "}
                            <Link to="/termos-de-uso" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Termos de Uso e Política de Privacidade
                            </Link>.
                        </p>
                        <p className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </CardFooter>
                    </fieldset>
                </form>
            </Card>
        </div>
    );
}

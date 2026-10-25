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
import { Dumbbell, ArrowLeft, Check, AlertCircle } from "lucide-react";

export default function PaginaCadastro() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErro("");

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (senha.length < 6) {
            setErro("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        // TODO: integrar com backend de autenticação
        console.log("Cadastro:", { nome, email, senha });
        navigate("/principal");
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-8">
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

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {erro && (
                            <div className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{erro}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome completo</Label>
                            <Input
                                id="nome"
                                type="text"
                                placeholder="Seu nome completo"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

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
                            <Label htmlFor="senha">Senha</Label>
                            <Input
                                id="senha"
                                type="password"
                                placeholder="Mínimo de 6 caracteres"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmar-senha">Confirmar senha</Label>
                            <Input
                                id="confirmar-senha"
                                type="password"
                                placeholder="Repita sua senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                required
                            />
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-primary" />
                                <span>Acompanhamento diário de metas</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-primary" />
                                <span>Planos e rotinas inteligentes</span>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pt-2">
                        <Button type="submit" className="w-full h-11 font-medium shadow-sm">
                            Criar minha conta
                        </Button>
                        <p className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Faça login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

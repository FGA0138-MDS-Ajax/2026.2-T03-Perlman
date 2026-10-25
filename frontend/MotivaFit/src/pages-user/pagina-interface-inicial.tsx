import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Dumbbell, BarChart3, Flame, Shield, ArrowRight, Sparkles } from "lucide-react";

export default function PaginaInterfaceInicial() {
    return (
        <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
                            <Dumbbell className="h-5 w-5" />
                        </div>
                        <h1 className="text-xl font-heading font-black tracking-tight text-foreground">
                            Motiva<span className="text-primary">Fit</span>
                        </h1>
                    </div>

                    <nav className="flex items-center gap-2">
                        <Button variant="ghost" asChild>
                            <Link to="/login">Entrar</Link>
                        </Button>
                        <Button asChild>
                            <Link to="/cadastro">Criar Conta</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
                            <Link to="/admin">
                                <Shield className="h-3.5 w-3.5 mr-1" />
                                Admin
                            </Link>
                        </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mx-auto max-w-3xl space-y-6">
                    <Badge variant="outline" className="gap-1.5 py-1 px-3 text-xs font-medium border-primary/30 text-primary bg-primary/5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Plataforma Inteligente de Treinos
                    </Badge>

                    <h2 className="text-4xl font-heading font-extrabold tracking-tight sm:text-6xl text-balance">
                        Transforme sua rotina e conquiste sua <span className="text-primary underline decoration-primary/40 decoration-wavy decoration-2">melhor versão</span>
                    </h2>

                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                        O MotivaFit é o ecossistema definitivo para você planejar, monitorar seu progresso e se manter motivado a cada repetição.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                        <Button size="lg" className="h-12 px-8 font-medium gap-2 shadow-md shadow-primary/20" asChild>
                            <Link to="/cadastro">
                                Comece agora gratuitamente
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                            <Link to="/login">Já sou aluno</Link>
                        </Button>
                    </div>
                </div>

                {/* Features Grid */}
                <section className="grid w-full max-w-5xl gap-6 pt-16 sm:grid-cols-3 text-left">
                    <Card className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardHeader className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-heading">Acompanhamento Métrico</CardTitle>
                            <CardDescription>
                                Visualize evolução de cargas, frequência e calorias com métricas detalhadas e claras.
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardHeader className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Dumbbell className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-heading">Treinos Personalizados</CardTitle>
                            <CardDescription>
                                Fichas divididas por grupamento e adaptadas aos seus objetivos (Hipertrofia, Força ou HIIT).
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="hover:border-primary/50 transition-colors shadow-sm">
                        <CardHeader className="space-y-2">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Flame className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg font-heading">Motivação Diária</CardTitle>
                            <CardDescription>
                                Sequências de dias ativos, metas batidas e lembretes para você nunca perder um treino.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t px-6 py-6 text-center text-sm text-muted-foreground bg-muted/20">
                <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span>© 2026 MotivaFit — MDS / UnB. Todos os direitos reservados.</span>
                    <div className="flex items-center gap-4 text-xs">
                        <Link to="/login" className="hover:text-foreground">Login</Link>
                        <Link to="/cadastro" className="hover:text-foreground">Cadastro</Link>
                        <Link to="/admin" className="hover:text-foreground">Painel Admin</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

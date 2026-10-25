import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import {
    Home,
    Dumbbell,
    LineChart,
    Settings,
    LogOut,
    CheckCircle2,
    Flame,
    Calendar,
    Zap,
    Shield
} from "lucide-react";
import { ThemeToggle, ThemeSelector } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";

interface Exercicio {
    id: number;
    nome: string;
    series: string;
    carga: string;
}

export default function PaginaPrincipal() {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [treinosConcluidos, setTreinosConcluidos] = useState<number[]>([1]);

    function alternarTreino(id: number) {
        if (treinosConcluidos.includes(id)) {
            setTreinosConcluidos(treinosConcluidos.filter((i) => i !== id));
        } else {
            setTreinosConcluidos([...treinosConcluidos, id]);
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    const exerciciosHoje: Exercicio[] = [];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-muted/30 p-6 md:flex">
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-heading font-bold text-foreground">MotivaFit</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    <Button variant="secondary" className="justify-start gap-2.5">
                        <Home className="h-4 w-4" />
                        Início
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5">
                        <Dumbbell className="h-4 w-4" />
                        Meus Treinos
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5">
                        <LineChart className="h-4 w-4" />
                        Progresso
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5">
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>

                    <Separator className="my-3" />

                    <div className="space-y-1.5 px-0.5">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block px-1">
                            Tema
                        </span>
                        <ThemeSelector className="w-full" />
                    </div>

                    {isAdmin && (
                        <>
                            <Separator className="my-3" />
                            <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" asChild>
                                <Link to="/admin">
                                    <Shield className="h-3.5 w-3.5" />
                                    Painel Administrativo
                                </Link>
                            </Button>
                        </>
                    )}
                </nav>

                <Separator className="my-4" />
                <Button
                    variant="ghost"
                    className="justify-start gap-2 text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-x-hidden">
                {/* Top Bar */}
                <header className="flex items-center justify-between border-b px-6 py-4 bg-background/60 backdrop-blur">
                    <div>
                        <h1 className="text-xl font-heading font-bold">Painel do Aluno</h1>
                        <p className="text-xs text-muted-foreground">Foco de hoje: Treino personalizado</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="outline" className="h-9 w-9" />
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-medium">{user?.nome || "Aluno"}</span>
                            <span className="block text-xs text-muted-foreground">{user?.email || "aluno@motivafit.com"}</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarImage src="" alt="Avatar do usuário" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user?.nome ? user.nome.slice(0, 2).toUpperCase() : "AL"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 space-y-6 p-6">
                    {/* Summary Cards */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Treinos na Semana</CardDescription>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">3 / 5</div>
                                <p className="text-xs text-muted-foreground mt-1">Faltam 2 para sua meta</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Sequência Ativa</CardDescription>
                                <Flame className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-primary">7 Dias</div>
                                <p className="text-xs text-muted-foreground mt-1">Seu recorde é de 14 dias</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Calorias Queimadas</CardDescription>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">1.480</div>
                                <p className="text-xs text-muted-foreground mt-1">Kcal estimadas na semana</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Próximo Treino</CardDescription>
                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">Hoje</div>
                                <Badge variant="secondary" className="mt-1 text-xs">Treino A - Superior</Badge>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Activity Section */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        {/* Ficha de hoje interativa */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-heading">Treino de Hoje (Treino A)</CardTitle>
                                        <CardDescription>
                                            Marque os exercícios conforme você completa cada série
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="text-xs font-mono">
                                        {treinosConcluidos.length}/{exerciciosHoje.length} Concluídos
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {exerciciosHoje.map((ex) => {
                                    const feito = treinosConcluidos.includes(ex.id);
                                    return (
                                        <div
                                            key={ex.id}
                                            onClick={() => alternarTreino(ex.id)}
                                            className={`flex cursor-pointer items-center justify-between rounded-lg border p-3.5 transition-all ${
                                                feito
                                                    ? "bg-primary/5 border-primary/30 text-muted-foreground line-through"
                                                    : "bg-card hover:border-primary/40"
                                            }`}
                                        >
                                            <div className="space-y-0.5">
                                                <div className="font-medium text-foreground">{ex.nome}</div>
                                                <div className="text-xs text-muted-foreground">{ex.series} • {ex.carga}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2
                                                    className={`h-5 w-5 ${
                                                        feito ? "text-primary" : "text-muted-foreground/30"
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                <Button className="w-full mt-4 h-11 font-medium shadow-sm">
                                    Concluir Treino de Hoje
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Histórico Recente */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">Histórico Recente</CardTitle>
                                <CardDescription>Suas últimas sessões registradas</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="font-medium text-sm">Treino C - Costas & Bíceps</span>
                                        <span className="block text-xs text-muted-foreground">5 exercícios • 48 minutos</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">Ontem</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="font-medium text-sm">Treino B - Pernas & Core</span>
                                        <span className="block text-xs text-muted-foreground">6 exercícios • 55 minutos</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">2 dias atrás</Badge>
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <span className="font-medium text-sm">Treino A - Peito & Tríceps</span>
                                        <span className="block text-xs text-muted-foreground">4 exercícios • 42 minutos</span>
                                    </div>
                                    <Badge variant="outline" className="text-xs">4 dias atrás</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </main>
            </div>
        </div>
    );
}

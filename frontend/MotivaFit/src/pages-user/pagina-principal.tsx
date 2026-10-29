import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import {
    Home,
    Dumbbell,
    LogOut,
    Flame,
    Calendar,
    Shield
} from "lucide-react";
import { ThemeToggle, ThemeSelector } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import {
    getWorkoutHistory,
    registerWorkoutCompletion,
    WORKOUT_HISTORY_UPDATED_EVENT,
    type WorkoutCompletion,
} from "@/lib/workout-history";
import {
    enrollInWorkoutPlan,
    getUserWorkoutPlanIds,
    leaveWorkoutPlan,
    WORKOUT_ENROLLMENTS_UPDATED_EVENT,
} from "@/lib/workout-enrollments";
import { WORKOUT_PLANS } from "@/lib/workout-plans";

function obterChaveData(data: Date): string {
    return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
}

export default function PaginaPrincipal() {
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [historicoTreinos, setHistoricoTreinos] = useState<WorkoutCompletion[]>(getWorkoutHistory);
    const [referenciaAtual, setReferenciaAtual] = useState(Date.now);
    const [fichasInscritas, setFichasInscritas] = useState<string[]>(() =>
        user ? getUserWorkoutPlanIds(user.email) : []
    );
    const historicoDoUsuario = historicoTreinos
        .filter((treino) =>
            user &&
            treino.userEmail?.trim().toLowerCase() === user.email.trim().toLowerCase()
        )
        .filter((treino) => Number.isFinite(new Date(treino.completedAt).getTime()))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const fichasDoUsuario = WORKOUT_PLANS.filter((ficha) => fichasInscritas.includes(ficha.id));
    const agora = new Date(referenciaAtual);
    const inicioDaSemana = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const diaDaSemana = inicioDaSemana.getDay();
    inicioDaSemana.setDate(inicioDaSemana.getDate() - (diaDaSemana === 0 ? 6 : diaDaSemana - 1));
    const treinosNaSemana = historicoDoUsuario.filter(
        (treino) => new Date(treino.completedAt).getTime() >= inicioDaSemana.getTime()
    ).length;
    const diasComTreino = new Set(
        historicoDoUsuario.map((treino) => obterChaveData(new Date(treino.completedAt)))
    );
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const inicioSequencia = new Date(hoje);
    if (!diasComTreino.has(obterChaveData(inicioSequencia))) {
        inicioSequencia.setDate(inicioSequencia.getDate() - 1);
    }
    let sequenciaAtiva = 0;
    while (diasComTreino.has(obterChaveData(inicioSequencia))) {
        sequenciaAtiva += 1;
        inicioSequencia.setDate(inicioSequencia.getDate() - 1);
    }

    useEffect(() => {
        function atualizarHistorico() {
            setHistoricoTreinos(getWorkoutHistory());
            setReferenciaAtual(Date.now());
        }

        function atualizarFichasInscritas() {
            if (user) {
                setFichasInscritas(getUserWorkoutPlanIds(user.email));
            }
        }

        window.addEventListener(WORKOUT_HISTORY_UPDATED_EVENT, atualizarHistorico);
        window.addEventListener("storage", atualizarHistorico);
        window.addEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarFichasInscritas);
        window.addEventListener("storage", atualizarFichasInscritas);

        return () => {
            window.removeEventListener(WORKOUT_HISTORY_UPDATED_EVENT, atualizarHistorico);
            window.removeEventListener("storage", atualizarHistorico);
            window.removeEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarFichasInscritas);
            window.removeEventListener("storage", atualizarFichasInscritas);
        };
    }, [user]);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    function handleConcluirTreino(workoutPlanId: string) {
        if (!user) {
            navigate("/login");
            return;
        }

        registerWorkoutCompletion(user.id, user.email, workoutPlanId);
    }

    function alternarInscricao(workoutPlanId: string) {
        if (!user) {
            navigate("/login");
            return;
        }

        if (fichasInscritas.includes(workoutPlanId)) {
            leaveWorkoutPlan(user.email, workoutPlanId);
        } else {
            enrollInWorkoutPlan(user.email, workoutPlanId);
        }
        setFichasInscritas(getUserWorkoutPlanIds(user.email));
    }

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
                    <Button
                        variant="ghost"
                        className="justify-start gap-2.5"
                        onClick={() =>
                            document.getElementById("fichas-disponiveis")?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        <Dumbbell className="h-4 w-4" />
                        Meus Treinos
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
                        <p className="text-xs text-muted-foreground">
                            Olá, {user?.nome || "aluno"} — acompanhe sua atividade e suas fichas.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle variant="outline" className="h-9 w-9" />
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-medium">{user?.nome || "Aluno"}</span>
                            <span className="block text-xs text-muted-foreground">{user?.email || "aluno@motivafit.com"}</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {user?.nome ? user.nome.slice(0, 2).toUpperCase() : "AL"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 space-y-6 p-6">
                    {/* Summary Cards */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Treinos na Semana</CardDescription>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">{treinosNaSemana}</div>
                                <p className="text-xs text-muted-foreground mt-1">Treinos registrados desde segunda-feira</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Sequência Ativa</CardDescription>
                                <Flame className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-primary">
                                    {sequenciaAtiva} {sequenciaAtiva === 1 ? "dia" : "dias"}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Dias consecutivos com treino registrado</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Fichas inscritas</CardDescription>
                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">{fichasDoUsuario.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {fichasDoUsuario.length === 1 ? "Ficha vinculada ao seu perfil" : "Fichas vinculadas ao seu perfil"}
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Activity Section */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">Minhas fichas</CardTitle>
                                <CardDescription>
                                    Conclua uma sessão para registrar sua atividade no perfil.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {fichasDoUsuario.length === 0 ? (
                                    <p className="py-4 text-sm text-muted-foreground">
                                        Você ainda não está inscrito em nenhuma ficha. Escolha uma nas fichas disponíveis abaixo.
                                    </p>
                                ) : fichasDoUsuario.map((ficha) => (
                                    <div key={ficha.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-medium">{ficha.title}</p>
                                            <p className="text-sm text-muted-foreground">{ficha.frequency}</p>
                                        </div>
                                        <Button onClick={() => handleConcluirTreino(ficha.id)}>
                                            Registrar treino concluído
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Histórico Recente */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">Histórico Recente</CardTitle>
                                <CardDescription>Conclusões registradas para seu perfil</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                    {historicoDoUsuario.length === 0 ? (
                                        <p className="py-4 text-sm text-muted-foreground">
                                            Nenhum treino concluído registrado para este perfil.
                                        </p>
                                    ) : historicoDoUsuario.slice(0, 5).map((treino, index) => {
                                        const ficha = WORKOUT_PLANS.find((item) => item.id === treino.workoutPlanId);
                                        return (
                                            <div key={`${treino.completedAt}-${index}`}>
                                                {index > 0 && <Separator className="mb-4" />}
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="space-y-0.5">
                                                        <span className="text-sm font-medium">
                                                            {ficha?.title ?? "Treino concluído"}
                                                        </span>
                                                        <span className="block text-xs text-muted-foreground">
                                                            {new Date(treino.completedAt).toLocaleString("pt-BR")}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">Concluído</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </CardContent>
                        </Card>
                    </section>

                    <section id="fichas-disponiveis" className="space-y-4">
                        <div>
                            <h2 className="text-xl font-heading font-bold">Fichas de Treino</h2>
                            <p className="text-sm text-muted-foreground">Inscreva-se ou cancele suas fichas.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {WORKOUT_PLANS.map((ficha) => {
                                const inscrito = fichasInscritas.includes(ficha.id);
                                return (
                                    <Card key={ficha.id}>
                                        <CardHeader>
                                            <CardTitle>{ficha.title}</CardTitle>
                                            <CardDescription>{ficha.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground">
                                                Frequência: {ficha.frequency}
                                            </p>
                                            <Button
                                                className="w-full"
                                                variant={inscrito ? "outline" : "default"}
                                                onClick={() => alternarInscricao(ficha.id)}
                                            >
                                                {inscrito ? "Cancelar inscrição" : "Inscrever-se"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    getWorkoutHistory,
    WORKOUT_HISTORY_UPDATED_EVENT,
    type WorkoutCompletion,
} from "@/lib/workout-history";
import {
    getWorkoutEnrollments,
    WORKOUT_ENROLLMENTS_UPDATED_EVENT,
    type WorkoutEnrollment,
} from "@/lib/workout-enrollments";
import { WORKOUT_PLANS } from "@/lib/workout-plans";

interface RelatorioUsuario {
    email: string;
    fichasInscritas: string[];
    treinosConcluidos: number;
    ultimoTreino: string | null;
}

function criarRelatorioUsuarios(
    inscricoes: WorkoutEnrollment[],
    historico: WorkoutCompletion[]
): RelatorioUsuario[] {
    const usuarios = new Map<string, RelatorioUsuario>();

    function obterUsuario(email: string): RelatorioUsuario {
        const emailNormalizado = email.trim().toLowerCase();
        let relatorio = usuarios.get(emailNormalizado);
        if (!relatorio) {
            relatorio = {
                email: emailNormalizado,
                fichasInscritas: [],
                treinosConcluidos: 0,
                ultimoTreino: null,
            };
            usuarios.set(emailNormalizado, relatorio);
        }
        return relatorio;
    }

    for (const inscricao of inscricoes) {
        const relatorio = obterUsuario(inscricao.userEmail);
        if (!relatorio.fichasInscritas.includes(inscricao.workoutPlanId)) {
            relatorio.fichasInscritas.push(inscricao.workoutPlanId);
        }
    }

    for (const treino of historico) {
        if (!treino.userEmail) continue;

        const treinoConcluidoEm = new Date(treino.completedAt).getTime();
        if (!Number.isFinite(treinoConcluidoEm)) continue;

        const relatorio = obterUsuario(treino.userEmail);
        relatorio.treinosConcluidos += 1;
        if (
            !relatorio.ultimoTreino ||
            treinoConcluidoEm > new Date(relatorio.ultimoTreino).getTime()
        ) {
            relatorio.ultimoTreino = treino.completedAt;
        }
    }

    return Array.from(usuarios.values()).sort((a, b) => a.email.localeCompare(b.email));
}

export default function PaginaRelatoriosAdmin() {
    const [historicoTreinos, setHistoricoTreinos] = useState(getWorkoutHistory);
    const [inscricoes, setInscricoes] = useState(getWorkoutEnrollments);
    const [referenciaRelatorio, setReferenciaRelatorio] = useState(Date.now);
    const relatorioUsuarios = criarRelatorioUsuarios(inscricoes, historicoTreinos);
    const trintaDiasAtras = referenciaRelatorio - 30 * 24 * 60 * 60 * 1000;
    const usuariosAtivosUltimos30Dias = new Set(
        historicoTreinos
            .filter((treino) => {
                if (!treino.userEmail) return false;
                const timestamp = new Date(treino.completedAt).getTime();
                return Number.isFinite(timestamp) && timestamp >= trintaDiasAtras;
            })
            .map((treino) => treino.userEmail!.trim().toLowerCase())
    ).size;
    const totalInscricoesAtivas = relatorioUsuarios.reduce(
        (total, usuario) => total + usuario.fichasInscritas.length,
        0
    );

    useEffect(() => {
        function atualizarHistorico() {
            setHistoricoTreinos(getWorkoutHistory());
            setReferenciaRelatorio(Date.now());
        }

        function atualizarInscricoes() {
            setInscricoes(getWorkoutEnrollments());
        }

        window.addEventListener(WORKOUT_HISTORY_UPDATED_EVENT, atualizarHistorico);
        window.addEventListener("storage", atualizarHistorico);
        window.addEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarInscricoes);

        return () => {
            window.removeEventListener(WORKOUT_HISTORY_UPDATED_EVENT, atualizarHistorico);
            window.removeEventListener("storage", atualizarHistorico);
            window.removeEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarInscricoes);
        };
    }, []);

    return (
        <AdminLayout title="Relatórios de Desempenho">
            <Card>
                <CardHeader>
                    <CardTitle>Relatórios e Métricas de Uso</CardTitle>
                    <CardDescription>
                        Dados calculados a partir das inscrições e dos treinos registrados neste navegador.
                        O histórico antigo sem e-mail não pode ser atribuído a um aluno.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border bg-card p-4">
                            <span className="text-sm text-muted-foreground">Alunos identificados</span>
                            <div className="mt-1 text-2xl font-bold">{relatorioUsuarios.length}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Com inscrição ou treino identificado por e-mail</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <span className="text-sm text-muted-foreground">Treinos concluídos</span>
                            <div className="mt-1 text-2xl font-bold text-primary">{historicoTreinos.length}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Total de registros no histórico</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <span className="text-sm text-muted-foreground">Inscrições ativas</span>
                            <div className="mt-1 text-2xl font-bold">{totalInscricoesAtivas}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Inscrições atuais em fichas</p>
                        </div>
                        <div className="rounded-lg border bg-card p-4">
                            <span className="text-sm text-muted-foreground">Alunos ativos (30 dias)</span>
                            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {usuariosAtivosUltimos30Dias}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">Com treino concluído no período</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Atividade por aluno</CardTitle>
                    <CardDescription>
                        Alunos com inscrição em ficha ou treino concluído identificado por e-mail.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {relatorioUsuarios.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            Ainda não há inscrições ou treinos identificados para exibir.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Aluno</TableHead>
                                        <TableHead>Fichas inscritas</TableHead>
                                        <TableHead>Treinos concluídos</TableHead>
                                        <TableHead>Último treino</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {relatorioUsuarios.map((relatorio) => (
                                        <TableRow key={relatorio.email}>
                                            <TableCell>{relatorio.email}</TableCell>
                                            <TableCell>
                                                {relatorio.fichasInscritas.length > 0
                                                    ? relatorio.fichasInscritas
                                                        .map((id) => WORKOUT_PLANS.find((ficha) => ficha.id === id)?.title ?? id)
                                                        .join(", ")
                                                    : "Nenhuma"}
                                            </TableCell>
                                            <TableCell>{relatorio.treinosConcluidos}</TableCell>
                                            <TableCell>
                                                {relatorio.ultimoTreino
                                                    ? new Date(relatorio.ultimoTreino).toLocaleDateString("pt-BR")
                                                    : "Nenhum"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}

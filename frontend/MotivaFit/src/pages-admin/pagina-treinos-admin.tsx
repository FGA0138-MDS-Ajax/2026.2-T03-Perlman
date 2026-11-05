import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    getWorkoutEnrollments,
    WORKOUT_ENROLLMENTS_UPDATED_EVENT,
    type WorkoutEnrollment,
} from "@/lib/workout-enrollments";
import { WORKOUT_PLANS } from "@/lib/workout-plans";

export default function PaginaTreinosAdmin() {
    const [inscricoes, setInscricoes] = useState<WorkoutEnrollment[]>(getWorkoutEnrollments);

    useEffect(() => {
        function atualizarInscricoes() {
            setInscricoes(getWorkoutEnrollments());
        }

        window.addEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarInscricoes);
        window.addEventListener("storage", atualizarInscricoes);

        return () => {
            window.removeEventListener(WORKOUT_ENROLLMENTS_UPDATED_EVENT, atualizarInscricoes);
            window.removeEventListener("storage", atualizarInscricoes);
        };
    }, []);

    return (
        <AdminLayout title="Gerenciamento de Treinos">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {WORKOUT_PLANS.map((ficha) => {
                    const totalInscritos = new Set(
                        inscricoes
                            .filter((inscricao) => inscricao.workoutPlanId === ficha.id)
                            .map((inscricao) => inscricao.userEmail.trim().toLowerCase())
                    ).size;

                    return (
                        <Card key={ficha.id}>
                            <CardHeader>
                                <CardTitle>{ficha.title}</CardTitle>
                                <CardDescription>{ficha.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p>🏋️ <strong>Alunos inscritos:</strong> {totalInscritos}</p>
                                <p>⏱️ <strong>Frequência:</strong> {ficha.frequency}</p>
                                <Button className="mt-3 w-full" variant="outline" disabled>
                                    Gerenciar Ficha
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </AdminLayout>
    );
}

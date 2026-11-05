export interface WorkoutPlan {
    id: string;
    title: string;
    description: string;
    frequency: string;
}

export const WORKOUT_PLANS: WorkoutPlan[] = [
    {
        id: "hipertrofia-iniciante",
        title: "Hipertrofia - Iniciante",
        description: "Plano de adaptação muscular (4 semanas)",
        frequency: "3x por semana",
    },
    {
        id: "emagrecimento-hiit",
        title: "Emagrecimento & HIIT",
        description: "Treinos com foco cardiovascular e déficit",
        frequency: "5x por semana",
    },
    {
        id: "forca-avancada",
        title: "Força Avançada (Power)",
        description: "Cargas progressivas e compostos pesados",
        frequency: "4x por semana",
    },
];

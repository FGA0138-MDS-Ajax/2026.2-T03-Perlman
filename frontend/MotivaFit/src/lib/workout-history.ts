export interface WorkoutCompletion {
    userId: string;
    completedAt: string;
    userEmail?: string;
    workoutPlanId?: string;
}

const STORAGE_KEY = "motivafit_workout_history";
export const WORKOUT_HISTORY_UPDATED_EVENT = "motivafit-workout-history-updated";

function isWorkoutCompletion(value: unknown): value is WorkoutCompletion {
    return (
        typeof value === "object" &&
        value !== null &&
        "userId" in value &&
        typeof value.userId === "string" &&
        "completedAt" in value &&
        typeof value.completedAt === "string" &&
        (!("userEmail" in value) || typeof value.userEmail === "string") &&
        (!("workoutPlanId" in value) || typeof value.workoutPlanId === "string")
    );
}

export function getWorkoutHistory(): WorkoutCompletion[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const history: unknown = JSON.parse(stored);
    if (!Array.isArray(history) || !history.every(isWorkoutCompletion)) {
        throw new Error("O histórico de treinos salvo está em um formato inválido.");
    }

    return history;
}

export function registerWorkoutCompletion(
    userId: string,
    userEmail?: string,
    workoutPlanId?: string
): void {
    const history = getWorkoutHistory();
    history.push({
        userId,
        completedAt: new Date().toISOString(),
        ...(userEmail ? { userEmail: userEmail.trim().toLowerCase() } : {}),
        ...(workoutPlanId ? { workoutPlanId } : {}),
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    window.dispatchEvent(new Event(WORKOUT_HISTORY_UPDATED_EVENT));
}

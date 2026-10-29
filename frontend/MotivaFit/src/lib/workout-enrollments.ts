export interface WorkoutEnrollment {
    userEmail: string;
    workoutPlanId: string;
}

const STORAGE_KEY = "motivafit_workout_enrollments";
export const WORKOUT_ENROLLMENTS_UPDATED_EVENT = "motivafit-workout-enrollments-updated";

function isWorkoutEnrollment(value: unknown): value is WorkoutEnrollment {
    return (
        typeof value === "object" &&
        value !== null &&
        "userEmail" in value &&
        typeof value.userEmail === "string" &&
        "workoutPlanId" in value &&
        typeof value.workoutPlanId === "string"
    );
}

function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function getWorkoutEnrollments(): WorkoutEnrollment[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const enrollments: unknown = JSON.parse(stored);
    if (!Array.isArray(enrollments) || !enrollments.every(isWorkoutEnrollment)) {
        throw new Error("As inscrições em fichas salvas estão em um formato inválido.");
    }

    return enrollments;
}

export function getWorkoutEnrollmentCount(workoutPlanId: string): number {
    const enrolledEmails = new Set(
        getWorkoutEnrollments()
            .filter((enrollment) => enrollment.workoutPlanId === workoutPlanId)
            .map((enrollment) => normalizeEmail(enrollment.userEmail))
    );
    return enrolledEmails.size;
}

export function getUserWorkoutPlanIds(userEmail: string): string[] {
    const normalizedEmail = normalizeEmail(userEmail);
    return Array.from(
        new Set(
            getWorkoutEnrollments()
                .filter((enrollment) => normalizeEmail(enrollment.userEmail) === normalizedEmail)
                .map((enrollment) => enrollment.workoutPlanId)
        )
    );
}

export function enrollInWorkoutPlan(userEmail: string, workoutPlanId: string): void {
    const enrollments = getWorkoutEnrollments();
    const normalizedEmail = normalizeEmail(userEmail);
    const alreadyEnrolled = enrollments.some(
        (enrollment) =>
            normalizeEmail(enrollment.userEmail) === normalizedEmail &&
            enrollment.workoutPlanId === workoutPlanId
    );

    if (alreadyEnrolled) return;

    enrollments.push({ userEmail: normalizedEmail, workoutPlanId });
    saveWorkoutEnrollments(enrollments);
}

export function leaveWorkoutPlan(userEmail: string, workoutPlanId: string): void {
    const normalizedEmail = normalizeEmail(userEmail);
    const enrollments = getWorkoutEnrollments().filter(
        (enrollment) =>
            normalizeEmail(enrollment.userEmail) !== normalizedEmail ||
            enrollment.workoutPlanId !== workoutPlanId
    );
    saveWorkoutEnrollments(enrollments);
}

function saveWorkoutEnrollments(enrollments: WorkoutEnrollment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
    window.dispatchEvent(new Event(WORKOUT_ENROLLMENTS_UPDATED_EVENT));
}

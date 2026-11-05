import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export interface ThemeToggleProps {
    className?: string;
    variant?: "ghost" | "outline" | "default" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    showLabel?: boolean;
}

export function ThemeToggle({
    className = "",
    variant = "ghost",
    size,
    showLabel = false,
}: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    return (
        <Button
            type="button"
            variant={variant}
            size={size || (showLabel ? "default" : "icon")}
            onClick={toggleTheme}
            className={`relative transition-all duration-300 ${className}`}
            title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
        >
            <div className="relative flex items-center justify-center">
                <Sun
                    className={`h-[1.15rem] w-[1.15rem] transition-all duration-500 transform ${
                        isDark
                            ? "-rotate-90 scale-0 opacity-0"
                            : "rotate-0 scale-100 opacity-100 text-amber-500"
                    }`}
                />
                <Moon
                    className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-500 transform ${
                        isDark
                            ? "rotate-0 scale-100 opacity-100 text-sky-400"
                            : "rotate-90 scale-0 opacity-0"
                    }`}
                />
            </div>
            {showLabel && (
                <span className="font-medium text-xs sm:text-sm">
                    {isDark ? "Modo Escuro" : "Modo Claro"}
                </span>
            )}
        </Button>
    );
}

export function ThemeSelector({ className = "" }: { className?: string }) {
    const { theme, setTheme } = useTheme();

    return (
        <div
            className={`grid grid-cols-3 w-full items-center rounded-lg border border-border bg-muted/40 p-1 text-muted-foreground ${className}`}
            role="group"
            aria-label="Seleção de tema"
        >
            <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all ${
                    theme === "light"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
                title="Ativar tema claro"
            >
                <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">Claro</span>
            </button>
            <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all ${
                    theme === "dark"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
                title="Ativar tema escuro"
            >
                <Moon className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                <span className="truncate">Escuro</span>
            </button>
            <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-xs font-medium transition-all ${
                    theme === "system"
                        ? "bg-background text-foreground shadow-xs font-semibold"
                        : "hover:text-foreground"
                }`}
                title="Sincronizar com as configurações do sistema (Automático)"
            >
                <Monitor className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Auto</span>
            </button>
        </div>
    );
}

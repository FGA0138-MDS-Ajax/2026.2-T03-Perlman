import * as React from "react";

export type Theme = "dark" | "light" | "system";

export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

export interface ThemeProviderState {
    theme: Theme;
    resolvedTheme: "dark" | "light";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const initialState: ThemeProviderState = {
    theme: "system",
    resolvedTheme: "light",
    setTheme: () => null,
    toggleTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "light",
    storageKey = "motivafit-theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(storageKey) as Theme | null;
            if (saved === "light" || saved === "dark" || saved === "system") {
                return saved;
            }
        }
        return defaultTheme;
    });

    const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(() => {
        if (typeof window !== "undefined") {
            if (theme === "system") {
                return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            }
            return theme;
        }
        return "light";
    });

    React.useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            root.classList.remove("light", "dark");

            let effective: "dark" | "light";
            if (theme === "system") {
                const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                effective = systemDark ? "dark" : "light";
            } else {
                effective = theme;
            }

            root.classList.add(effective);
            setResolvedTheme(effective);
        };

        applyTheme();

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const listener = () => applyTheme();
            mediaQuery.addEventListener("change", listener);
            return () => mediaQuery.removeEventListener("change", listener);
        }
    }, [theme]);

    const setTheme = React.useCallback(
        (newTheme: Theme) => {
            if (typeof window !== "undefined") {
                localStorage.setItem(storageKey, newTheme);
            }
            setThemeState(newTheme);
        },
        [storageKey]
    );

    const toggleTheme = React.useCallback(() => {
        const next = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(next);
    }, [resolvedTheme, setTheme]);

    const value = React.useMemo(
        () => ({
            theme,
            resolvedTheme,
            setTheme,
            toggleTheme,
        }),
        [theme, resolvedTheme, setTheme, toggleTheme]
    );

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export function useTheme() {
    const context = React.useContext(ThemeProviderContext);
    if (!context) {
        throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
    }
    return context;
}

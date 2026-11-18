import * as React from "react";
import { buscarPreferencias, salvarTema, type Tema } from "@/lib/api/preferencias-api";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";

export type Theme = Tema;
export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}
export interface ThemeProviderState {
    theme: Theme;
    resolvedTheme: "dark" | "light";
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    ocupado: boolean;
}
const ThemeProviderContext = React.createContext<ThemeProviderState>({
    theme: "light", resolvedTheme: "light", setTheme: () => {}, toggleTheme: () => {}, ocupado: false,
});

export function ThemeProvider(props: ThemeProviderProps) {
    const { user } = useAuth();
    return <TemaDaConta key={user?.id ?? "visitante"} {...props} autenticado={Boolean(user)} />;
}

function TemaDaConta({ children, defaultTheme = "light", autenticado }: ThemeProviderProps & { autenticado: boolean }) {
    const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">("light");
    const [carregando, setCarregando] = React.useState(autenticado);
    const [salvando, setSalvando] = React.useState(false);
    const [erro, setErro] = React.useState("");
    const [falhaAoSalvar, setFalhaAoSalvar] = React.useState(false);
    const [tentativa, setTentativa] = React.useState(0);
    const pendente = React.useRef(false);
    const gravacao = React.useRef<AbortController | null>(null);

    React.useEffect(() => {
        const controller = new AbortController();
        if (autenticado) void buscarPreferencias(controller.signal).then(({ tema }) => {
            if (!controller.signal.aborted) setThemeState(tema);
        }, (error: unknown) => {
            if (!controller.signal.aborted) setErro(`Não foi possível carregar o tema. ${mensagemAutenticacao(error)}`);
        }).finally(() => { if (!controller.signal.aborted) setCarregando(false); });
        return () => { controller.abort(); gravacao.current?.abort(); };
    }, [autenticado, tentativa]);

    React.useEffect(() => {
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        const aplicar = () => {
            const efetivo = theme === "system" ? media?.matches ? "dark" : "light" : theme;
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(efetivo);
            setResolvedTheme(efetivo);
        };
        aplicar();
        if (theme === "system") {
            media?.addEventListener("change", aplicar);
            return () => media?.removeEventListener("change", aplicar);
        }
    }, [theme]);

    const setTheme = React.useCallback((novo: Theme) => {
        if (carregando || pendente.current) return;
        setThemeState(novo);
        if (!autenticado) return;
        pendente.current = true;
        setSalvando(true);
        setErro("");
        setFalhaAoSalvar(false);
        const controller = new AbortController();
        gravacao.current = controller;
        void salvarTema(novo, controller.signal).then(({ tema }) => {
            if (!controller.signal.aborted) setThemeState(tema);
        }, (error: unknown) => {
            if (!controller.signal.aborted && !(error instanceof ApiError && error.code === "SESSAO_ALTERADA")) {
                setFalhaAoSalvar(true);
                setErro(`O tema foi aplicado nesta página, mas não foi salvo na sua conta. ${mensagemAutenticacao(error)}`);
            }
        }).finally(() => {
            pendente.current = false;
            if (!controller.signal.aborted) setSalvando(false);
        });
    }, [autenticado, carregando]);
    const toggleTheme = React.useCallback(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"), [resolvedTheme, setTheme]);
    const value = React.useMemo(() => ({ theme, resolvedTheme, setTheme, toggleTheme, ocupado: carregando || salvando }), [theme, resolvedTheme, setTheme, toggleTheme, carregando, salvando]);
    return <ThemeProviderContext.Provider value={value}>
        {erro && <div className="border-b bg-background p-3 text-sm"><p role="alert">{erro}</p>
            <button type="button" disabled={carregando || salvando} className="underline" onClick={() => {
                if (falhaAoSalvar) { setTheme(theme); return; }
                setErro(""); setCarregando(true); setTentativa((valor) => valor + 1);
            }}>{falhaAoSalvar ? "Tentar salvar tema novamente" : "Recarregar preferência de tema"}</button>
        </div>}
        {children}
    </ThemeProviderContext.Provider>;
}
export function useTheme() { return React.useContext(ThemeProviderContext); }

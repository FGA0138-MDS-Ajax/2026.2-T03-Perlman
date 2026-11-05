import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";

export interface User {
    id: string;
    nome: string;
    email: string;
    role: "admin" | "user";
}

// Banco inicial de e-mails autorizados como administradores
export const BANCO_ADMINS_PADRAO: string[] = [
    "admin@motivafit.com",
    "administrador@motivafit.com",
    "admin@admin.com",
];

const STORAGE_KEY_USER = "motivafit_user";
const STORAGE_KEY_ADMINS = "motivafit_banco_admins";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    admins: string[];
    login: (email: string, senha?: string, nome?: string) => boolean;
    cadastro: (nome: string, email: string, senha?: string) => boolean;
    logout: () => void;
    adicionarAdmin: (email: string) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

function carregarBancoAdmins(): string[] {
    if (typeof window === "undefined") return BANCO_ADMINS_PADRAO;
    try {
        const salvos = localStorage.getItem(STORAGE_KEY_ADMINS);
        if (salvos) {
            const parsed = JSON.parse(salvos);
            if (Array.isArray(parsed)) {
                return Array.from(new Set([...BANCO_ADMINS_PADRAO, ...parsed.map((e: string) => e.toLowerCase().trim())]));
            }
        }
    } catch (e) {
        console.error("Erro ao carregar banco de administradores:", e);
    }
    return BANCO_ADMINS_PADRAO;
}

function salvarBancoAdmins(admins: string[]) {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
    }
}

export function isEmailAdmin(email: string, listaAdmins?: string[]): boolean {
    const limpo = email.trim().toLowerCase();
    const lista = listaAdmins || carregarBancoAdmins();
    return lista.some((adm) => adm.trim().toLowerCase() === limpo);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admins, setAdmins] = React.useState<string[]>(carregarBancoAdmins);

    const [user, setUser] = React.useState<User | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            const salvo = localStorage.getItem(STORAGE_KEY_USER);
            if (salvo) {
                const parsed: User = JSON.parse(salvo);
                // Recalcula role com base no banco de administradores atualizado
                const role = isEmailAdmin(parsed.email, admins) ? "admin" : "user";
                return { ...parsed, role };
            }
        } catch (e) {
            console.error("Erro ao carregar sessão do usuário:", e);
        }
        return null;
    });

    const adicionarAdmin = React.useCallback((novoEmail: string) => {
        const limpo = novoEmail.trim().toLowerCase();
        if (!limpo) return;
        setAdmins((prev) => {
            if (prev.includes(limpo)) return prev;
            const novaLista = [...prev, limpo];
            salvarBancoAdmins(novaLista);
            return novaLista;
        });
    }, []);

    const login = React.useCallback(
        (email: string, _senha?: string, nomeCustom?: string): boolean => {
            const emailLimpo = email.trim().toLowerCase();
            const isAdminRole = isEmailAdmin(emailLimpo, admins);

            let nome = nomeCustom?.trim();
            if (!nome) {
                if (isAdminRole) {
                    nome = "Administrador";
                } else {
                    const parteEmail = emailLimpo.split("@")[0];
                    nome = parteEmail.charAt(0).toUpperCase() + parteEmail.slice(1);
                }
            }

            const novoUsuario: User = {
                id: Date.now().toString(),
                nome,
                email: emailLimpo,
                role: isAdminRole ? "admin" : "user",
            };

            setUser(novoUsuario);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(novoUsuario));
            return true;
        },
        [admins]
    );

    const cadastro = React.useCallback(
        (nome: string, email: string, _senha?: string): boolean => {
            const emailLimpo = email.trim().toLowerCase();
            const isAdminRole = isEmailAdmin(emailLimpo, admins);

            const novoUsuario: User = {
                id: Date.now().toString(),
                nome: nome.trim(),
                email: emailLimpo,
                role: isAdminRole ? "admin" : "user",
            };

            setUser(novoUsuario);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(novoUsuario));
            return true;
        },
        [admins]
    );

    const logout = React.useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY_USER);
    }, []);

    const isAuthenticated = user !== null;
    const isAdmin = user !== null && user.role === "admin";

    const value = React.useMemo(
        () => ({
            user,
            isAuthenticated,
            isAdmin,
            admins,
            login,
            cadastro,
            logout,
            adicionarAdmin,
        }),
        [user, isAuthenticated, isAdmin, admins, login, cadastro, logout, adicionarAdmin]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
    }
    return context;
}

/**
 * Guarda de rota: exige que o usuário esteja autenticado.
 * Se não estiver logado, redireciona para a tela de login.
 */
export function RotaProtegida({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

/**
 * Guarda de rota: exige que o usuário esteja autenticado E seja administrador.
 * Se não estiver logado -> vai para /login.
 * Se estiver logado mas seu e-mail não for de administrador -> vai para /principal.
 */
export function RotaAdmin({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/principal" replace />;
    }

    return <>{children}</>;
}

/**
 * Guarda para rotas públicas como /login e /cadastro:
 * Se o usuário já estiver logado, encaminha diretamente para seu painel.
 */
export function RotaPublica({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/admin" : "/principal"} replace />;
    }

    return <>{children}</>;
}

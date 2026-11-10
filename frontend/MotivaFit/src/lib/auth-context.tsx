import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import * as authApi from "@/lib/api/auth-api";
import { ApiError, getAccessToken, SESSION_CHANGED_EVENT, setAccessToken } from "@/lib/api/http-client";
import type { PerfilBackend } from "@/lib/api/contracts";

export interface User {
    id: string;
    nome: string;
    email: string;
    perfil: PerfilBackend;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperusuario: boolean;
    inicializando: boolean;
    enviando: boolean;
    aviso: string;
    limparAviso: () => void;
    login: (email: string, senha: string) => Promise<void>;
    cadastro: (email: string, senha: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function mensagemAutenticacao(error: unknown): string {
    return error instanceof ApiError ? error.message : "Não foi possível concluir a operação. Tente novamente.";
}

function usuarioDaSessao(): User | null {
    const token = getAccessToken();
    if (!token) return null;
    const claims = authApi.readJwtUsuarioClaims(token);
    if (!claims.ativo || claims.exp * 1000 <= Date.now()) throw new Error("Sessão inválida");
    return { id: String(claims.id), nome: claims.sub, email: claims.sub, perfil: claims.perfil };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null);
    const [inicializando, setInicializando] = React.useState(true);
    const [enviando, setEnviando] = React.useState(false);
    const [aviso, setAviso] = React.useState("");
    const operacaoPendente = React.useRef(false);
    const limparAviso = React.useCallback(() => setAviso(""), []);

    React.useEffect(() => {
        let ativo = true;
        let timer: ReturnType<typeof setTimeout>;
        function sincronizar() {
            clearTimeout(timer);
            try {
                const usuario = usuarioDaSessao();
                setUser(usuario);
                if (usuario) {
                    const claims = authApi.readJwtUsuarioClaims(getAccessToken()!);
                    const espera = Math.min(2_147_483_647, Math.max(1000, claims.exp * 1000 - Date.now() - 30_000));
                    timer = setTimeout(() => { void renovar(); }, espera);
                }
            } catch {
                setAviso("A sessão retornada é inválida. Entre novamente.");
                setAccessToken(null);
            }
        }
        async function renovar() {
            try {
                await authApi.refreshSession();
                if (ativo) sincronizar();
            } catch (error) {
                if (ativo && error instanceof ApiError && !["CSRF_AUSENTE", "SESSAO_ALTERADA"].includes(error.code)) {
                    setAviso(error.status === 401 || error.status === 403
                        ? "Sua sessão expirou. Entre novamente." : mensagemAutenticacao(error));
                }
            } finally {
                if (ativo) setInicializando(false);
            }
        }
        // As chaves do protótipo não são uma fonte de identidade ou autorização.
        try {
            localStorage.removeItem("motivafit_user");
            localStorage.removeItem("motivafit_banco_admins");
        } catch { /* Armazenamento bloqueado não impede autenticação em memória. */ }
        window.addEventListener(SESSION_CHANGED_EVENT, sincronizar);
        void renovar();
        return () => {
            ativo = false;
            clearTimeout(timer);
            window.removeEventListener(SESSION_CHANGED_EVENT, sincronizar);
        };
    }, []);

    async function executar(operacao: () => Promise<void>): Promise<void> {
        if (operacaoPendente.current) return;
        operacaoPendente.current = true;
        setEnviando(true);
        setAviso("");
        try { await operacao(); }
        finally { operacaoPendente.current = false; setEnviando(false); }
    }

    async function login(email: string, senha: string): Promise<void> {
        await executar(async () => {
            await authApi.login({ email: email.trim().toLowerCase(), senha });
        });
    }

    async function cadastro(email: string, senha: string): Promise<void> {
        await executar(async () => {
            await authApi.registerAccount({ email: email.trim().toLowerCase(), senha });
        });
    }

    async function logout(): Promise<void> {
        await executar(async () => {
            try { await authApi.logout(); }
            catch {
                setAviso("Você saiu deste dispositivo, mas não foi possível confirmar o encerramento da sessão no servidor.");
            }
        });
    }

    const isAdmin = user?.perfil === "ADMINISTRADOR" || user?.perfil === "SUPERUSUARIO";
    return <AuthContext.Provider value={{ user, isAuthenticated: user !== null, isAdmin,
        isSuperusuario: user?.perfil === "SUPERUSUARIO", inicializando, enviando, aviso,
        limparAviso, login, cadastro, logout }}>
        {aviso && <div role="alert" className="border-b bg-muted p-3 text-center text-sm">
            {aviso} <button type="button" onClick={limparAviso} className="ml-3 underline">Fechar</button>
        </div>}
        <React.Fragment key={user?.id ?? "anonimo"}>{children}</React.Fragment>
    </AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = React.useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
    return context;
}

function AguardandoSessao() {
    return <p role="status" className="p-8 text-center">Verificando sessão…</p>;
}

export function RotaProtegida({ children, perfil = "USUARIO" }: {
    children: React.ReactNode; perfil?: PerfilBackend;
}) {
    const { isAuthenticated, isAdmin, isSuperusuario, inicializando } = useAuth();
    const location = useLocation();
    if (inicializando) return <AguardandoSessao />;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
    if (perfil === "SUPERUSUARIO" && !isSuperusuario) return <Navigate to={isAdmin ? "/admin" : "/principal"} replace />;
    if (perfil === "ADMINISTRADOR" && !isAdmin) return <Navigate to="/principal" replace />;
    return <>{children}</>;
}

export function RotaAdmin({ children }: { children: React.ReactNode }) {
    return <RotaProtegida perfil="ADMINISTRADOR">{children}</RotaProtegida>;
}

export function RotaSuperusuario({ children }: { children: React.ReactNode }) {
    return <RotaProtegida perfil="SUPERUSUARIO">{children}</RotaProtegida>;
}

export function RotaPublica({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin, isSuperusuario, inicializando, enviando } = useAuth();
    const location = useLocation();
    if (inicializando) return <AguardandoSessao />;
    if (!isAuthenticated) return <>{children}</>;
    if (enviando) return <AguardandoSessao />;
    const from = location.state?.from?.pathname;
    const destinos = ["/principal", "/treinos", ...(isAdmin ? ["/admin", "/admin/treinos", "/admin/relatorios"] : []),
        ...(isSuperusuario ? ["/admin/superusuario"] : [])];
    return <Navigate to={destinos.includes(from) ? from : isAdmin ? "/admin" : "/principal"} replace />;
}

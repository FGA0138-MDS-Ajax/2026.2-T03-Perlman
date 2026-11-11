import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Dumbbell, History, Home, LogOut, Play, Shield } from "lucide-react";
import { Separator } from "@base-ui/react";

export default function HeaderMenu({ isAdmin, setMenuAberto, logout, saindo }: { isAdmin: boolean, setMenuAberto: (aberto: boolean) => void, logout: () => Promise<void>, saindo: boolean }) {
    const { pathname } = useLocation();
    const realizando = pathname === "/realizar-treino" || /^\/treinos\/[^/]+\/realizar$/.test(pathname);
    return (
        <>
            <nav aria-label="Menu principal" className="flex flex-1 flex-col gap-1.5" onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setMenuAberto(false); }}>
                <Button variant={pathname === "/principal" ? "secondary" : "ghost"} className="justify-start gap-2.5" asChild>
                    <Link to="/principal" aria-current={pathname === "/principal" ? "page" : undefined}><Home className="h-4 w-4" />Início</Link>
                </Button>
                <Button variant={pathname === "/treinos" ? "secondary" : "ghost"} className="justify-start gap-2.5" asChild>
                    <Link to="/treinos" aria-current={pathname === "/treinos" ? "page" : undefined}><Dumbbell className="h-4 w-4" />Meus Treinos</Link>
                </Button>
                <Button variant={realizando ? "secondary" : "ghost"} className="justify-start gap-2.5" asChild>
                    <Link to="/realizar-treino" aria-current={realizando ? "page" : undefined}><Play className="h-4 w-4" />Realizar treino</Link>
                </Button>
                <Button variant={pathname === "/historico" ? "secondary" : "ghost"} className="justify-start gap-2.5" asChild>
                    <Link to="/historico" aria-current={pathname === "/historico" ? "page" : undefined}><History className="h-4 w-4" />Histórico</Link>
                </Button>
                {isAdmin && (
                    <>
                        <Separator className="my-3" />
                        <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" asChild>
                            <Link to="/admin"><Shield className="h-3.5 w-3.5" />Painel Administrativo</Link>
                        </Button>
                    </>
                )}
            </nav>
            <Separator className="my-4" />
            <Button
                variant="ghost"
                className="justify-start gap-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => { setMenuAberto(false); void logout(); }}
                disabled={saindo}
            >
                <LogOut className="h-4 w-4" />Sair
            </Button>
        </>
    )
}
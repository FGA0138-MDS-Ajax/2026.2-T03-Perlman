import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { Dumbbell, ExternalLink, FileText, LayoutDashboard, LogOut, Settings } from "lucide-react";

interface AdminLayoutProps {
    title: string;
    children: ReactNode;
}

const navigationItems = [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Treinos", to: "/admin/treinos", icon: Dumbbell },
    { label: "Relatórios", to: "/admin/relatorios", icon: FileText },
    { label: "SuperUsuário", to: "/admin/superusuario", icon: Settings },
];

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const { user, logout, isSuperusuario, enviando } = useAuth();

    if (!user) return null;

    function handleLogout() {
        void logout();
    }

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="hidden w-64 flex-col border-r bg-muted/40 p-6 md:flex">
                <div className="mb-6 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                        M
                    </span>
                    <div>
                        <h2 className="font-heading text-lg font-bold leading-none text-primary">MotivaFit</h2>
                        <span className="text-xs text-muted-foreground">Painel Admin</span>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    {navigationItems.filter((item) => item.to !== "/admin/superusuario" || isSuperusuario).map(({ label, to, icon: Icon }) => (
                        <Button
                            key={to}
                            variant="ghost"
                            className="justify-start gap-2.5"
                            asChild
                        >
                            <Link to={to}>
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        </Button>
                    ))}

                    <Separator className="my-3" />

                    <Button variant="outline" className="justify-start gap-2 text-xs" asChild>
                        <Link to="/principal">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver App do Aluno
                        </Link>
                    </Button>
                </nav>

                <Separator className="my-4" />
                <Button
                    variant="ghost"
                    className="justify-start gap-2 text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                    disabled={enviando}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between gap-3 border-b bg-card/60 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
                    <div className="min-w-0">
                        <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">{title}</h1>
                        <p className="text-xs text-muted-foreground">MotivaFit</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden text-right sm:block">
                            <span className="block text-sm font-medium">{user.nome}</span>
                            <span className="block text-xs text-muted-foreground">{user.email}</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                {user.nome.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <nav aria-label="Navegação administrativa" className="flex gap-1 overflow-x-auto border-b px-3 py-2 md:hidden">
                    {navigationItems.filter((item) => item.to !== "/admin/superusuario" || isSuperusuario).map(({ label, to, icon: Icon }) => (
                        <Button key={to} variant="ghost" size="sm" className="shrink-0 gap-2" asChild>
                            <Link to={to}>
                                <Icon className="h-4 w-4" />
                                {label}
                            </Link>
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" className="shrink-0 gap-2" asChild>
                        <Link to="/principal">
                            <ExternalLink className="h-4 w-4" />
                            App do Aluno
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 gap-2 text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                        disabled={enviando}
                    >
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </nav>

                <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}

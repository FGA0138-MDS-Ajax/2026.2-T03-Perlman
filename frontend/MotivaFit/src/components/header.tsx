import { useEffect, useRef } from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "./ui/avatar";

function iniciais(email: string): string {
    const base = email.trim().slice(0, 2).toUpperCase();
    return base || "AL";
}

export default function Header({ menuAberto, setMenuAberto, email, title, subtitle }: { menuAberto: boolean; setMenuAberto: (aberto: boolean) => void; email: string; title: string; subtitle: string }) {
    const botaoMenuRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!menuAberto) return;

        function fecharComEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") return;
            setMenuAberto(false);
            botaoMenuRef.current?.focus();
        }

        window.addEventListener("keydown", fecharComEscape);
        return () => window.removeEventListener("keydown", fecharComEscape);
    }, [menuAberto, setMenuAberto]);

    return (
        <header className="flex items-center justify-between gap-3 border-b bg-background/60 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 cursor-pointer"
                    aria-label="Abrir menu"
                    ref={botaoMenuRef}
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                
                <div className="min-w-0">
                    <h1 className="truncate font-heading text-lg font-bold sm:text-xl">{title}</h1>
                    <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <ThemeToggle variant="outline" className="h-9 w-9" />
                <div className="hidden text-right sm:block">
                    <span className="block text-sm font-medium">{email || "Aluno"}</span>
                </div>
                <Avatar className="h-9 w-9 border border-primary/20">
                    <AvatarFallback className="bg-primary/10 font-bold text-primary">
                        {iniciais(email)}
                    </AvatarFallback>
                </Avatar>
            </div>
        </header>
    )
}
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback } from "./ui/avatar";

function iniciais(email: string): string {
    const base = email.trim().slice(0, 2).toUpperCase();
    return base || "AL";
}

export default function Header({ menuAberto, setMenuAberto, email, title, subtitle }: { menuAberto: boolean; setMenuAberto: (aberto: boolean) => void; email: string; title: string; subtitle: string }) {
    return (
        <header className="flex items-center justify-between border-b bg-background/60 px-6 py-4 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 cursor-pointer"
                    aria-label="Abrir menu"
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                
                <div className="min-w-0">
                    <h1 className="font-heading text-xl font-bold">{title}</h1>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
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
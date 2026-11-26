import { Dumbbell } from "lucide-react";
import HeaderMenu from "./menu";
import { Button } from "./ui/button";

export default function Aside({ menuAberto, setMenuAberto, isAdmin, logout, saindo }: { menuAberto: boolean; setMenuAberto: (aberto: boolean) => void; isAdmin: boolean; logout: () => Promise<void>; saindo: boolean }) {
    const asideClass = (menuAberto: boolean) => {
        return menuAberto
            ? "fixed inset-0 z-50 flex h-dvh w-full flex-col border-r bg-background p-6 md:static md:h-auto md:w-64"
            : "hidden w-64 flex-col border-r bg-muted/30 p-6 md:flex";
    };

    return (
        <aside
            className={asideClass(menuAberto)}
            role={menuAberto ? "dialog" : undefined}
            aria-modal={menuAberto ? true : undefined}
            aria-label={menuAberto ? "Menu" : undefined}
        >
            <div className="mb-6 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Dumbbell className="h-5 w-5" />
                </div>
                <span className="font-heading text-lg font-bold">MotivaFit</span>
            </div>

            <HeaderMenu isAdmin={isAdmin} setMenuAberto={setMenuAberto} logout={logout} saindo={saindo} />
            <div className="mt-auto flex justify-center">
                <Button className="w-full mt-3 cursor-pointer" onClick={() => setMenuAberto(false)}>Fechar</Button>
            </div>
        </aside>
    )
}
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { TAMANHO_PAGINA_ADMIN } from "@/lib/api/admin-api";

export function EstadoConsultaAdmin({ estado, atualizar, children }: {
    estado: { status: "carregando" | "sucesso" } | { status: "erro"; mensagem: string };
    atualizar: () => void;
    children: ReactNode;
}) {
    if (estado.status === "carregando") return <p role="status">Carregando dados…</p>;
    if (estado.status === "erro") return <div className="space-y-3"><p role="alert">{estado.mensagem}</p><Button onClick={atualizar}>Tentar novamente</Button></div>;
    return <div className="space-y-4"><Button variant="outline" onClick={atualizar}>Atualizar dados</Button>{children}</div>;
}
export function PaginacaoAdmin({ pagina, total, setPagina }: { pagina: number; total: number; setPagina: (pagina: number) => void }) {
    return <nav aria-label="Paginação" className="flex items-center gap-3">
        <Button variant="outline" disabled={pagina === 0} onClick={() => setPagina(pagina - 1)}>Anterior</Button>
        <span>Página {pagina + 1}</span>
        <Button variant="outline" disabled={(pagina + 1) * TAMANHO_PAGINA_ADMIN >= total} onClick={() => setPagina(pagina + 1)}>Próxima</Button>
    </nav>;
}

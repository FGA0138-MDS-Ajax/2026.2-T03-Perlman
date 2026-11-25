import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EstadoConsultaAdmin({ estado, atualizar, children }: {
    estado: { status: "carregando" | "sucesso" } | { status: "erro"; mensagem: string };
    atualizar: () => void;
    children: ReactNode;
}) {
    if (estado.status === "carregando") return <p role="status">Carregando dados…</p>;
    if (estado.status === "erro") return <div className="space-y-3"><p role="alert">{estado.mensagem}</p><Button onClick={atualizar}>Tentar novamente</Button></div>;
    return <div className="space-y-4"><Button variant="outline" onClick={atualizar}>Atualizar dados</Button>{children}</div>;
}

export function formatarPercentual(valor: number | null | undefined): string {
    return valor == null ? "—" : `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function rotuloModalidade(valor: string): string {
    return valor === "MUSCULACAO" ? "Musculação" : valor === "AEROBICO" ? "Aeróbico" : valor;
}

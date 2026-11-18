import { useEffect, useState } from "react";
import { ApiError } from "@/lib/api/http-client";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";

type Consulta<T> = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: T };
export function useConsultaAdmin<T>(buscar: (pagina: number, signal: AbortSignal) => Promise<T>) {
    const { user } = useAuth();
    const usuarioId = user?.id;
    const [pagina, setPagina] = useState(0);
    const [tentativa, setTentativa] = useState(0);
    const [resultado, setResultado] = useState<{ chave: string; estado: Consulta<T> } | null>(null);
    const chave = `${usuarioId}:${pagina}:${tentativa}`;
    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        if (usuarioId) void buscar(pagina, controller.signal).then((dados) => {
            if (ativo) setResultado({ chave, estado: { status: "sucesso", dados } });
        }, (erro: unknown) => {
            if (!ativo || erro instanceof ApiError && erro.code === "SESSAO_ALTERADA" || erro instanceof Error && erro.name === "AbortError") return;
            setResultado({ chave, estado: { status: "erro", mensagem: mensagemAutenticacao(erro) } });
        });
        return () => { ativo = false; controller.abort(); };
    }, [buscar, chave, pagina, usuarioId]);
    const estado: Consulta<T> = resultado?.chave === chave ? resultado.estado : { status: "carregando" };
    return { estado, pagina, setPagina, atualizar: () => setTentativa((valor) => valor + 1) };
}

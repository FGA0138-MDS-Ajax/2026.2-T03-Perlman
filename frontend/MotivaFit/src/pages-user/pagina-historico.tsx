import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Aside from "@/components/aside";
import Header from "@/components/header";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import type { RegistroDiarioResponseDTO } from "@/lib/api/contracts";
import { listarTodasAsExecucoes } from "@/lib/api/registros-api";
import { chaveDiaNegocio } from "@/lib/indicadores-execucao";
import {
    agruparPorDia,
    deslocarDia,
    deslocarMes,
    execucoesNoIntervalo,
    intervaloDaSemana,
    intervaloDoMes,
    rotuloDia,
    rotuloIntervalo,
    rotuloMes,
    type VisaoHistorico,
} from "@/lib/historico-periodos";
import { formatarDataTreino } from "@/lib/treinos-apresentacao";

type EstadoHistorico =
    | { status: "carregando" }
    | { status: "sucesso"; itens: RegistroDiarioResponseDTO[] }
    | { status: "erro"; mensagem: string };

const VISOES: { valor: VisaoHistorico; rotulo: string }[] = [
    { valor: "lista", rotulo: "Lista" },
    { valor: "semana", rotulo: "Semana" },
    { valor: "mes", rotulo: "Mês" },
];

function ignorar(error: unknown): boolean {
    if (error instanceof ApiError && error.code === "SESSAO_ALTERADA") return true;
    return error instanceof Error && error.name === "AbortError";
}

function detalhesDaExecucao(registro: RegistroDiarioResponseDTO): string {
    const partes: string[] = [];
    if (registro.series != null) partes.push(`${registro.series} séries`);
    if (registro.repeticoes != null) partes.push(`${registro.repeticoes} repetições`);
    if (registro.cargaKg != null) partes.push(`${registro.cargaKg} kg`);
    if (registro.distanciaM != null) partes.push(`${registro.distanciaM} m`);
    partes.push(`${registro.tempoS} s`);
    return partes.join(" · ");
}

function ExecucaoItem({ registro }: { registro: RegistroDiarioResponseDTO }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-0.5">
                <span className="text-sm font-medium">{registro.exercicioNome}</span>
                <span className="block text-xs text-muted-foreground">
                    {registro.treinoNome ?? "Sem treino vinculado"} · {formatarDataTreino(registro.executadoEm)}
                </span>
                <span className="block text-xs text-muted-foreground">{detalhesDaExecucao(registro)}</span>
            </div>
            <Badge variant="outline" className="shrink-0 text-xs">Execução</Badge>
        </div>
    );
}

export default function PaginaHistorico() {
    const { user, logout, isAdmin, enviando } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const [visao, setVisao] = useState<VisaoHistorico>("lista");
    const [ancora, setAncora] = useState(() => chaveDiaNegocio(new Date()));
    const [historico, setHistorico] = useState<EstadoHistorico>({ status: "carregando" });
    const [tentativa, setTentativa] = useState(0);
    const hoje = chaveDiaNegocio(new Date());
    const intervalo = visao === "mes" ? intervaloDoMes(ancora) : intervaloDaSemana(ancora);
    const inicioProximo = visao === "mes" ? deslocarMes(intervalo.inicio, 1) : deslocarDia(intervalo.inicio, 7);
    const podeAvancar = inicioProximo <= hoje;
    const rotuloPeriodo = visao === "mes" ? rotuloMes(intervalo.inicio) : rotuloIntervalo(intervalo.inicio, intervalo.fim);
    const itens = historico.status === "sucesso"
        ? visao === "lista" ? historico.itens : execucoesNoIntervalo(historico.itens, intervalo.inicio, intervalo.fim)
        : [];
    const grupos = visao === "lista" ? [] : agruparPorDia(itens);

    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        listarTodasAsExecucoes(controller.signal).then((registros) => {
            if (ativo) setHistorico({ status: "sucesso", itens: registros });
        }, (error: unknown) => {
            if (!ativo || ignorar(error)) return;
            setHistorico({ status: "erro", mensagem: mensagemAutenticacao(error) });
        });
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [tentativa]);

    function voltarPeriodo() {
        setAncora((atual) => {
            if (visao === "mes") return deslocarMes(intervaloDoMes(atual).inicio, -1);
            return deslocarDia(intervaloDaSemana(atual).inicio, -7);
        });
    }

    function avancarPeriodo() {
        if (!podeAvancar) return;
        setAncora(inicioProximo);
    }

    const rotuloAnterior = visao === "mes" ? "Mês anterior" : "Semana anterior";
    const rotuloSeguinte = visao === "mes" ? "Próximo mês" : "Próxima semana";
    const periodoNaFrase = rotuloPeriodo.charAt(0).toLowerCase() + rotuloPeriodo.slice(1);
    const vazio = visao === "lista"
        ? "Nenhuma execução registrada nesta conta."
        : visao === "mes"
            ? `Nenhuma execução em ${periodoNaFrase}.`
            : `Nenhuma execução na semana de ${periodoNaFrase}.`;

    return (
        <div className="flex min-h-screen w-full bg-background">
            <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={enviando} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    email={user?.email || ""}
                    menuAberto={menuAberto}
                    setMenuAberto={setMenuAberto}
                    title="Histórico"
                    subtitle="Exercícios registrados na sua conta, do mais recente ao mais antigo."
                />
                <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-heading">Histórico de exercícios</CardTitle>
                            <CardDescription>
                                Cada linha é um exercício registrado nesta conta. A semana começa na segunda-feira, no horário de Brasília.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div role="group" aria-label="Forma de listagem" className="flex flex-wrap gap-2">
                                {VISOES.map((opcao) => (
                                    <Button
                                        key={opcao.valor}
                                        type="button"
                                        variant={visao === opcao.valor ? "secondary" : "outline"}
                                        aria-pressed={visao === opcao.valor}
                                        onClick={() => setVisao(opcao.valor)}
                                    >
                                        {opcao.rotulo}
                                    </Button>
                                ))}
                            </div>

                            {visao !== "lista" && (
                                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" aria-label={rotuloAnterior} onClick={voltarPeriodo}>
                                        <ChevronLeft />
                                    </Button>
                                    <h2 aria-live="polite" className="truncate text-center text-sm font-medium sm:text-base">{rotuloPeriodo}</h2>
                                    <Button type="button" variant="outline" size="icon" aria-label={rotuloSeguinte} onClick={avancarPeriodo} disabled={!podeAvancar}>
                                        <ChevronRight />
                                    </Button>
                                </div>
                            )}

                            {historico.status === "carregando" && <p role="status" className="text-sm">Carregando histórico…</p>}
                            {historico.status === "erro" && (
                                <div className="space-y-2">
                                    <p role="alert" className="text-sm text-destructive">{historico.mensagem}</p>
                                    <Button type="button" variant="outline" onClick={() => { setHistorico({ status: "carregando" }); setTentativa((valor) => valor + 1); }}>Tentar novamente</Button>
                                </div>
                            )}
                            {historico.status === "sucesso" && itens.length === 0 && (
                                <p className="py-4 text-sm text-muted-foreground">{vazio}</p>
                            )}
                            {historico.status === "sucesso" && itens.length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {itens.length === 1 ? "1 execução" : `${itens.length} execuções`}
                                </p>
                            )}
                            {visao === "lista" && itens.map((registro, index) => (
                                <div key={registro.id}>
                                    {index > 0 && <Separator className="mb-4" />}
                                    <ExecucaoItem registro={registro} />
                                </div>
                            ))}
                            {visao !== "lista" && grupos.map((grupo) => (
                                <section key={grupo.dia} className="space-y-3" aria-label={rotuloDia(grupo.dia)}>
                                    <h3 className="text-sm font-medium">{rotuloDia(grupo.dia)}</h3>
                                    {grupo.itens.map((registro, index) => (
                                        <div key={registro.id}>
                                            {index > 0 && <Separator className="mb-3" />}
                                            <ExecucaoItem registro={registro} />
                                        </div>
                                    ))}
                                </section>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

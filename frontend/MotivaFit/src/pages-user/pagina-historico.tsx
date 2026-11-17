import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Aside from "@/components/aside";
import Header from "@/components/header";
import ImagemExercicio from "@/components/imagem-exercicio";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import type { RegistroDiarioResponseDTO } from "@/lib/api/contracts";
import { atualizarRegistro, excluirRegistro, listarTodasAsExecucoes } from "@/lib/api/registros-api";
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

function ExecucaoItem({ registro, editar, excluir }: { registro: RegistroDiarioResponseDTO; editar: (registro: RegistroDiarioResponseDTO) => void; excluir: (registro: RegistroDiarioResponseDTO) => void }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <ImagemExercicio nome={registro.exercicioNome} tamanho="thumb" />
                <div className="min-w-0 space-y-0.5">
                    <span className="text-sm font-medium">{registro.exercicioNome}</span>
                    <span className="block text-xs text-muted-foreground">
                        {registro.treinoNome ?? "Sem treino vinculado"} · {formatarDataTreino(registro.executadoEm)}
                    </span>
                    <span className="block text-xs text-muted-foreground">{detalhesDaExecucao(registro)}</span>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Badge variant="outline" className="text-xs">Execução</Badge>
                <Button type="button" variant="outline" size="sm" onClick={() => editar(registro)}>Editar</Button>
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => excluir(registro)}>Excluir</Button>
            </div>
        </div>
    );
}

export default function PaginaHistorico() {
    const { user, logout, isAdmin, enviando } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const [visao, setVisao] = useState<VisaoHistorico>("lista");
    const [registroEditando, setRegistroEditando] = useState<RegistroDiarioResponseDTO | null>(null);
    const [registroExcluindo, setRegistroExcluindo] = useState<RegistroDiarioResponseDTO | null>(null);
    const [dadosEdicao, setDadosEdicao] = useState({ cargaKg: "", repeticoes: "", series: "", tempoS: "", distanciaM: "" });
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
    const [erroAcao, setErroAcao] = useState("");
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

    function abrirEdicao(registro: RegistroDiarioResponseDTO) {
        setErroAcao("");
        setDadosEdicao({
            cargaKg: registro.cargaKg?.toString() ?? "",
            repeticoes: registro.repeticoes?.toString() ?? "",
            series: registro.series?.toString() ?? "",
            tempoS: registro.tempoS.toString(),
            distanciaM: registro.distanciaM?.toString() ?? "",
        });
        setRegistroEditando(registro);
    }

    async function salvarEdicao() {
        if (!registroEditando) return;
        setAcaoEmAndamento(true);
        setErroAcao("");
        const numero = (valor: string) => valor.trim() === "" ? undefined : Number(valor);
        try {
            await atualizarRegistro(registroEditando.id, {
                catalogoId: registroEditando.catalogoId,
                treinoId: registroEditando.treinoId ?? undefined,
                exercicioId: registroEditando.exercicioId ?? undefined,
                cargaKg: numero(dadosEdicao.cargaKg),
                repeticoes: numero(dadosEdicao.repeticoes),
                series: numero(dadosEdicao.series),
                tempoS: Number(dadosEdicao.tempoS),
                distanciaM: numero(dadosEdicao.distanciaM),
            });
            setRegistroEditando(null);
            setTentativa((valor) => valor + 1);
        } catch (error) {
            setErroAcao(mensagemAutenticacao(error));
        } finally {
            setAcaoEmAndamento(false);
        }
    }

    async function confirmarExclusao() {
        if (!registroExcluindo) return;
        setAcaoEmAndamento(true);
        setErroAcao("");
        try {
            await excluirRegistro(registroExcluindo.id);
            setRegistroExcluindo(null);
            setTentativa((valor) => valor + 1);
        } catch (error) {
            setErroAcao(mensagemAutenticacao(error));
        } finally {
            setAcaoEmAndamento(false);
        }
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
                                    <ExecucaoItem registro={registro} editar={abrirEdicao} excluir={(item) => { setErroAcao(""); setRegistroExcluindo(item); }} />
                                </div>
                            ))}
                            {visao !== "lista" && grupos.map((grupo) => (
                                <section key={grupo.dia} className="space-y-3" aria-label={rotuloDia(grupo.dia)}>
                                    <h3 className="text-sm font-medium">{rotuloDia(grupo.dia)}</h3>
                                    {grupo.itens.map((registro, index) => (
                                        <div key={registro.id}>
                                            {index > 0 && <Separator className="mb-3" />}
                                            <ExecucaoItem registro={registro} editar={abrirEdicao} excluir={(item) => { setErroAcao(""); setRegistroExcluindo(item); }} />
                                        </div>
                                    ))}
                                </section>
                            ))}
                        </CardContent>
                    </Card>

                    <Dialog open={registroEditando !== null} onOpenChange={(aberto) => { if (!aberto) setRegistroEditando(null); }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Editar execução</DialogTitle>
                                <DialogDescription>{registroEditando?.exercicioNome}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {([
                                    ["cargaKg", "Carga (kg)"],
                                    ["repeticoes", "Repetições"],
                                    ["series", "Séries"],
                                    ["tempoS", "Tempo (s)"],
                                    ["distanciaM", "Distância (m)"],
                                ] as const).map(([campo, rotulo]) => (
                                    <div key={campo} className="space-y-1.5">
                                        <Label htmlFor={`registro-${campo}`}>{rotulo}</Label>
                                        <Input id={`registro-${campo}`} type="number" min="0" step={campo === "tempoS" || campo === "distanciaM" ? "1" : "0.1"} value={dadosEdicao[campo]} onChange={(event) => setDadosEdicao((atual) => ({ ...atual, [campo]: event.target.value }))} />
                                    </div>
                                ))}
                            </div>
                            {erroAcao && <p role="alert" className="text-sm text-destructive">{erroAcao}</p>}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRegistroEditando(null)} disabled={acaoEmAndamento}>Cancelar</Button>
                                <Button type="button" onClick={() => void salvarEdicao()} disabled={acaoEmAndamento}>{acaoEmAndamento ? "Salvando…" : "Salvar"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={registroExcluindo !== null} onOpenChange={(aberto) => { if (!aberto) setRegistroExcluindo(null); }}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Excluir execução</DialogTitle>
                                <DialogDescription>Esta ação remove permanentemente o registro de {registroExcluindo?.exercicioNome}.</DialogDescription>
                            </DialogHeader>
                            {erroAcao && <p role="alert" className="text-sm text-destructive">{erroAcao}</p>}
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setRegistroExcluindo(null)} disabled={acaoEmAndamento}>Cancelar</Button>
                                <Button type="button" variant="destructive" onClick={() => void confirmarExclusao()} disabled={acaoEmAndamento}>{acaoEmAndamento ? "Excluindo…" : "Excluir"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}

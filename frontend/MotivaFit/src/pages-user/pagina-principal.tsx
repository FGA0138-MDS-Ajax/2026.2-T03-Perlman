import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import {
    Dumbbell,
    Flame,
    Calendar,
} from "lucide-react";
import { mensagemAutenticacao, useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import type { RegistroDiarioResponseDTO, TreinoResponseDTO } from "@/lib/api/contracts";
import { listarRegistros, listarTodasAsExecucoes, TAMANHO_PAGINA_HISTORICO } from "@/lib/api/registros-api";
import { listarTreinos } from "@/lib/api/treinos-api";
import { resumirExecucoes } from "@/lib/indicadores-execucao";
import { formatarDataTreino } from "@/lib/treinos-apresentacao";
import Aside from "@/components/aside";
import Header from "@/components/header";

type EstadoFichas =
    | { status: "carregando" }
    | { status: "sucesso"; itens: TreinoResponseDTO[] }
    | { status: "erro"; mensagem: string };

type EstadoHistorico =
    | { status: "carregando" }
    | { status: "sucesso"; itens: RegistroDiarioResponseDTO[]; proximaPagina: number; temMais: boolean }
    | { status: "erro"; mensagem: string };
type EstadoIndicadores =
    | { status: "carregando" }
    | { status: "sucesso"; execucoesNaSemana: number; sequenciaDias: number }
    | { status: "erro"; mensagem: string };

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

export default function PaginaPrincipal() {
    const { user, logout, isAdmin, enviando } = useAuth();
    const [fichasVinculadas, setFichasVinculadas] = useState<EstadoFichas>({ status: "carregando" });
    const [tentativaFichas, setTentativaFichas] = useState(0);
    const [historico, setHistorico] = useState<EstadoHistorico>({ status: "carregando" });
    const [indicadores, setIndicadores] = useState<EstadoIndicadores>({ status: "carregando" });
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [avisoHistorico, setAvisoHistorico] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const execucoesNaSemana = indicadores.status === "sucesso" ? indicadores.execucoesNaSemana : null;
    const sequenciaAtiva = indicadores.status === "sucesso" ? indicadores.sequenciaDias : null;
    const [menuAberto, setMenuAberto] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        listarRegistros(0, TAMANHO_PAGINA_HISTORICO, controller.signal).then((itens) => {
            if (!ativo) return;
            setHistorico({
                status: "sucesso",
                itens,
                proximaPagina: 1,
                temMais: itens.length === TAMANHO_PAGINA_HISTORICO,
            });
        }, (error: unknown) => {
            if (!ativo || ignorar(error)) return;
            setHistorico({ status: "erro", mensagem: mensagemAutenticacao(error) });
        });
        listarTodasAsExecucoes(controller.signal).then((registros) => {
            if (!ativo) return;
            setIndicadores({ status: "sucesso", ...resumirExecucoes(registros, new Date()) });
        }, (error: unknown) => {
            if (!ativo || ignorar(error)) return;
            setIndicadores({ status: "erro", mensagem: mensagemAutenticacao(error) });
        });
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [tentativa]);

    useEffect(() => {
        const controller = new AbortController();
        let ativo = true;
        setFichasVinculadas({ status: "carregando" });
        if (user) {
            listarTreinos(controller.signal).then((treinos) => {
                if (!ativo) return;
                setFichasVinculadas({ status: "sucesso", itens: treinos.filter((treino) => treino.meuTreino) });
            }, (error: unknown) => {
                if (!ativo || ignorar(error)) return;
                setFichasVinculadas({ status: "erro", mensagem: mensagemAutenticacao(error) });
            });
        }
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [user, tentativaFichas]);

    async function carregarMais() {
        if (historico.status !== "sucesso" || !historico.temMais || carregandoMais) return;
        const pagina = historico.proximaPagina;
        setCarregandoMais(true);
        setAvisoHistorico("");
        try {
            const lote = await listarRegistros(pagina, TAMANHO_PAGINA_HISTORICO);
            setHistorico((atual) => {
                if (atual.status !== "sucesso") return atual;
                return {
                    status: "sucesso",
                    itens: [...atual.itens, ...lote],
                    proximaPagina: pagina + 1,
                    temMais: lote.length === TAMANHO_PAGINA_HISTORICO,
                };
            });
        } catch (error) {
            if (!ignorar(error)) setAvisoHistorico(mensagemAutenticacao(error));
        } finally {
            setCarregandoMais(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            {/* Sidebar */}
            <Aside menuAberto={menuAberto} setMenuAberto={setMenuAberto} isAdmin={isAdmin} logout={logout} saindo={enviando} />

            {/* Main Content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top Bar */}
                <Header
                    email={user?.email || ""}
                    menuAberto={menuAberto}
                    setMenuAberto={setMenuAberto}
                    title="Painel do Aluno"
                    subtitle="Acompanhe sua atividade e suas fichas."
                />

                {/* Dashboard Content */}
                <main className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
                    {/* Summary Cards */}
                    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Execuções na semana</CardDescription>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">{execucoesNaSemana ?? "—"}</div>
                                <p className="text-xs text-muted-foreground mt-1">Exercícios registrados desde segunda-feira, no horário de Brasília. Cada item é uma execução, não um treino concluído.</p>
                                {indicadores.status === "carregando" && <p role="status" className="mt-2 text-xs">Carregando indicadores…</p>}
                                {indicadores.status === "erro" && <p role="alert" className="mt-2 text-xs text-destructive">{indicadores.mensagem}</p>}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Sequência Ativa</CardDescription>
                                <Flame className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-primary">
                                    {sequenciaAtiva === null ? "—" : `${sequenciaAtiva} ${sequenciaAtiva === 1 ? "dia" : "dias"}`}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Dias seguidos com pelo menos uma execução. O dia não representa uma sessão de treino.</p>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardDescription>Fichas inscritas</CardDescription>
                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-heading font-bold text-foreground">{fichasVinculadas.status === "sucesso" ? fichasVinculadas.itens.length : "—"}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {fichasVinculadas.status === "sucesso" && fichasVinculadas.itens.length === 1 ? "Ficha vinculada ao seu perfil" : "Fichas vinculadas ao seu perfil"}
                                </p>
                                {fichasVinculadas.status === "carregando" && <p role="status" className="mt-2 text-xs">Carregando fichas…</p>}
                                {fichasVinculadas.status === "erro" && (
                                    <div className="mt-2 space-y-2">
                                        <p role="alert" className="text-xs text-destructive">{fichasVinculadas.mensagem}</p>
                                        <Button variant="outline" onClick={() => setTentativaFichas((atual) => atual + 1)}>Tentar carregar fichas novamente</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    {/* Activity Section */}
                    <section className="grid gap-6 lg:grid-cols-2">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">Minhas fichas</CardTitle>
                                <CardDescription>
                                    Treinos vinculados à sua conta. Adicione ou edite suas fichas em Meus treinos.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {fichasVinculadas.status === "carregando" ? <p role="status">Carregando suas fichas…</p> : fichasVinculadas.status === "erro" ? <p role="alert">{fichasVinculadas.mensagem}</p> : fichasVinculadas.itens.length === 0 ? (
                                    <p className="py-4 text-sm text-muted-foreground">
                                        Você ainda não tem fichas vinculadas. Adicione uma em Meus treinos.
                                    </p>
                                ) : fichasVinculadas.itens.map((ficha) => (
                                    <div key={ficha.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-medium">{ficha.nome}</p>
                                            <p className="text-sm text-muted-foreground">{ficha.tipo === "MUSCULACAO" ? "Musculação" : "Aeróbico"}</p>
                                        </div>
                                        <Button variant="outline" asChild>
                                            <Link to="/realizar-treino">Ir para Realizar treino</Link>
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Histórico Recente */}
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-heading">Histórico de execuções</CardTitle>
                                <CardDescription>Cada linha é um exercício registrado nesta conta, com o nome guardado na execução.</CardDescription>
                                <Button variant="outline" size="sm" className="mt-2 w-fit" asChild>
                                    <Link to="/historico">Ver histórico</Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {historico.status === "carregando" && <p role="status" className="text-sm">Carregando histórico…</p>}
                                {historico.status === "erro" && <p role="alert" className="text-sm text-destructive">{historico.mensagem}</p>}
                                {avisoHistorico && <p role="alert" className="text-sm text-destructive">{avisoHistorico}</p>}
                                {(historico.status === "erro" || indicadores.status === "erro") && (
                                    <Button type="button" variant="outline" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</Button>
                                )}
                                {historico.status === "sucesso" && historico.itens.length === 0 && (
                                    <p className="py-4 text-sm text-muted-foreground">Nenhuma execução registrada nesta conta.</p>
                                )}
                                {historico.status === "sucesso" && historico.itens.map((registro, index) => (
                                    <div key={registro.id}>
                                        {index > 0 && <Separator className="mb-4" />}
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <span className="text-sm font-medium">{registro.exercicioNome}</span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {registro.treinoNome ?? "Sem treino vinculado"} · {formatarDataTreino(registro.executadoEm)}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">{detalhesDaExecucao(registro)}</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs">Execução</Badge>
                                        </div>
                                    </div>
                                ))}
                                {historico.status === "sucesso" && historico.temMais && (
                                    <Button type="button" variant="outline" onClick={() => { void carregarMais(); }} disabled={carregandoMais}>
                                        {carregandoMais ? "Carregando…" : "Carregar mais"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <Button variant="outline" asChild>
                        <Link to="/treinos">Adicionar ficha de treino</Link>
                    </Button>
                </main>
            </div>
        </div>
    );
}

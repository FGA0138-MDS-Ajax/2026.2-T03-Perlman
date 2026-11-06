import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Dumbbell, Home, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mensagemAutenticacao } from "@/lib/auth-context";
import { ApiError } from "@/lib/api/http-client";
import { listarCatalogoExercicios } from "@/lib/api/catalogo-exercicios-api";
import { listarExerciciosDoTreino } from "@/lib/api/exercicios-api";
import { registrarExecucao } from "@/lib/api/registros-api";
import { buscarTreino } from "@/lib/api/treinos-api";
import type { CatalogoExercicioResponseDTO, ExercicioResponseDTO, ModalidadeBackend, TreinoResponseDTO } from "@/lib/api/contracts";
import { ROTULO_TIPO } from "@/lib/treinos-apresentacao";

type Consulta<T> = { status: "carregando" } | { status: "sucesso"; dados: T } | { status: "erro"; mensagem: string };
type Ficha = { treino: TreinoResponseDTO; exercicios: ExercicioResponseDTO[]; catalogo: CatalogoExercicioResponseDTO[] };
type Campos = { series: string; repeticoes: string; cargaKg: string; tempoMinutos: string; distanciaM: string; chave: string | null; registrado: boolean };

function ignorar(error: unknown): boolean {
    if (error instanceof ApiError && error.code === "SESSAO_ALTERADA") return true;
    return error instanceof Error && error.name === "AbortError";
}

function inteiroPositivo(valor: string): number | null {
    if (!/^\d+$/.test(valor.trim())) return null;
    const numero = Number(valor);
    return numero > 0 ? numero : null;
}

function decimal(valor: string, permiteZero: boolean): number | null {
    const texto = valor.trim().replace(",", ".");
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) return null;
    const numero = Number(texto);
    if (permiteZero) return numero >= 0 ? numero : null;
    return numero > 0 ? numero : null;
}

function segundosDeMinutos(valor: string): number | null {
    const minutos = decimal(valor, false);
    if (minutos === null) return null;
    const segundos = Math.round(minutos * 60);
    return segundos > 0 ? segundos : null;
}

function pedidoInvalido(modalidade: ModalidadeBackend, campos: Campos): string | null {
    if (segundosDeMinutos(campos.tempoMinutos) === null) return "Informe o tempo em minutos.";
    if (modalidade === "MUSCULACAO") {
        if (inteiroPositivo(campos.series) === null) return "Informe as séries.";
        if (inteiroPositivo(campos.repeticoes) === null) return "Informe as repetições.";
        if (campos.cargaKg.trim() && decimal(campos.cargaKg, true) === null) return "A carga deve ser um número com até duas casas.";
        return null;
    }
    if (campos.distanciaM.trim() && decimal(campos.distanciaM, false) === null) return "A distância deve ser maior que zero, com até duas casas.";
    return null;
}

export default function PaginaRealizarTreino() {
    const parametro = Number(useParams().treinoId);
    const idValido = Number.isInteger(parametro) && parametro > 0;
    const [consulta, setConsulta] = useState<Consulta<Ficha>>({ status: "carregando" });
    const [campos, setCampos] = useState<Record<number, Campos>>({});
    const [enviando, setEnviando] = useState(false);
    const [aviso, setAviso] = useState("");
    const [registrado, setRegistrado] = useState(false);
    const [tentativa, setTentativa] = useState(0);
    const [pedidoAtual, setPedidoAtual] = useState({ id: parametro, tentativa });
    if (pedidoAtual.id !== parametro || pedidoAtual.tentativa !== tentativa) {
        setPedidoAtual({ id: parametro, tentativa });
        setConsulta({ status: "carregando" });
    }

    useEffect(() => {
        if (!idValido) return;
        const controller = new AbortController();
        let ativo = true;
        Promise.all([
            buscarTreino(parametro, controller.signal),
            listarExerciciosDoTreino(parametro, controller.signal),
            listarCatalogoExercicios(controller.signal),
        ]).then(([treino, exercicios, catalogo]) => {
            if (ativo) setConsulta({ status: "sucesso", dados: { treino, exercicios, catalogo } });
        }, (error: unknown) => {
            if (!ativo || ignorar(error)) return;
            setConsulta({ status: "erro", mensagem: mensagemAutenticacao(error) });
        });
        return () => {
            ativo = false;
            controller.abort();
        };
    }, [idValido, parametro, tentativa]);

    function valores(exercicioId: number): Campos {
        return campos[exercicioId] ?? { series: "", repeticoes: "", cargaKg: "", tempoMinutos: "", distanciaM: "", chave: null, registrado: false };
    }

    function alterar(exercicioId: number, campo: keyof Campos, valor: string) {
        setRegistrado(false);
        setAviso("");
        setCampos((atual) => ({ ...atual, [exercicioId]: { ...valores(exercicioId), ...atual[exercicioId], [campo]: valor, registrado: false } }));
    }

    function corpoDoExercicio(exercicio: ExercicioResponseDTO, modalidade: ModalidadeBackend, atual: Campos, chave: string) {
        const tempoS = segundosDeMinutos(atual.tempoMinutos)!;
        const comum = { catalogoId: exercicio.catalogoExercicioId, treinoId: parametro, exercicioId: exercicio.id, tempoS, chaveIdempotencia: chave };
        if (modalidade === "MUSCULACAO") {
            return { ...comum, series: inteiroPositivo(atual.series)!, repeticoes: inteiroPositivo(atual.repeticoes)!, ...(atual.cargaKg.trim() ? { cargaKg: decimal(atual.cargaKg, true)! } : {}) };
        }
        return { ...comum, ...(atual.distanciaM.trim() ? { distanciaM: decimal(atual.distanciaM, false)! } : {}) };
    }

    async function salvar(event: FormEvent) {
        event.preventDefault();
        if (enviando || consulta.status !== "sucesso" || !consulta.dados.treino.meuTreino) return;
        const pendentes = consulta.dados.exercicios.filter((exercicio) => !valores(exercicio.id).registrado);
        for (const exercicio of pendentes) {
            const catalogo = consulta.dados.catalogo.find((item) => item.id === exercicio.catalogoExercicioId);
            const nome = catalogo?.nome ?? `Exercício ${exercicio.catalogoExercicioId}`;
            const erro = pedidoInvalido(catalogo?.modalidade ?? consulta.dados.treino.tipo, valores(exercicio.id));
            if (erro) {
                setAviso(`${nome}: ${erro}`);
                return;
            }
        }
        setEnviando(true);
        setAviso("");
        const gravados = new Set<number>();
        for (const exercicio of pendentes) {
            const catalogo = consulta.dados.catalogo.find((item) => item.id === exercicio.catalogoExercicioId);
            const modalidade = catalogo?.modalidade ?? consulta.dados.treino.tipo;
            const atual = valores(exercicio.id);
            const chave = atual.chave ?? crypto.randomUUID();
            try {
                await registrarExecucao(corpoDoExercicio(exercicio, modalidade, atual, chave));
                gravados.add(exercicio.id);
            } catch (error) {
                if (ignorar(error)) return;
                setCampos((estado) => {
                    const proximo = { ...estado };
                    for (const id of gravados) proximo[id] = { ...(proximo[id] ?? atual), registrado: true, chave: null };
                    proximo[exercicio.id] = { ...atual, chave, registrado: false };
                    return proximo;
                });
                setAviso(`Não foi possível registrar ${catalogo?.nome ?? `Exercício ${exercicio.catalogoExercicioId}`}. ${mensagemAutenticacao(error)}`);
                setEnviando(false);
                return;
            }
        }
        setCampos({});
        setRegistrado(true);
        setEnviando(false);
    }

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="hidden w-64 flex-col border-r bg-muted/30 p-6 md:flex">
                <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Dumbbell className="h-5 w-5" /></div>
                    <span className="font-heading text-lg font-bold">MotivaFit</span>
                </div>
                <nav className="flex flex-1 flex-col gap-1.5">
                    <Button variant="ghost" className="justify-start gap-2.5" asChild><Link to="/principal"><Home className="h-4 w-4" />Início</Link></Button>
                    <Button variant="ghost" className="justify-start gap-2.5" asChild><Link to="/treinos"><Dumbbell className="h-4 w-4" />Meus Treinos</Link></Button>
                    <Button variant="secondary" className="justify-start gap-2.5" asChild><Link to="/treinos"><Play className="h-4 w-4" />Realizar treino</Link></Button>
                </nav>
            </aside>
            <main className="flex-1 space-y-6 p-6">
                <p><Link to="/treinos" className="text-sm text-primary underline-offset-4 hover:underline">Voltar aos treinos</Link></p>
                {!idValido && <p role="alert">Treino inválido.</p>}
                {idValido && consulta.status === "carregando" && <p role="status">Carregando treino…</p>}
                {idValido && consulta.status === "erro" && (
                    <div role="alert" className="space-y-3">
                        <p>{consulta.mensagem}</p>
                        <Button type="button" variant="outline" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</Button>
                    </div>
                )}
                {consulta.status === "sucesso" && (
                    <section className="mx-auto max-w-3xl space-y-4">
                        <header>
                            <h1 className="font-heading text-2xl font-bold">{consulta.dados.treino.nome}</h1>
                            <p className="text-sm text-muted-foreground">Registrar o que você realizou. Modalidade: {ROTULO_TIPO[consulta.dados.treino.tipo]}.</p>
                        </header>
                        {!consulta.dados.treino.meuTreino && <p>Você pode consultar este treino, mas só registra execução nos seus treinos.</p>}
                        {consulta.dados.treino.meuTreino && consulta.dados.exercicios.length === 0 && <p>Este treino não tem exercícios para registrar.</p>}
                        {consulta.dados.treino.meuTreino && consulta.dados.exercicios.length > 0 && (
                            <form className="space-y-4" onSubmit={(event) => { void salvar(event); }}>
                                {aviso && <p role="alert" className="text-sm text-destructive">{aviso}</p>}
                                {registrado && <p role="status" className="text-sm">Execução registrada.</p>}
                                {consulta.dados.exercicios.map((exercicio) => {
                                    const catalogo = consulta.dados.catalogo.find((item) => item.id === exercicio.catalogoExercicioId);
                                    const modalidade = catalogo?.modalidade ?? consulta.dados.treino.tipo;
                                    const nome = catalogo?.nome ?? `Exercício ${exercicio.catalogoExercicioId}`;
                                    const atual = valores(exercicio.id);
                                    return (
                                        <Card key={exercicio.id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{nome}</CardTitle>
                                                <CardDescription>Meta: {exercicio.meta}{exercicio.metaRecorde ? `. Recorde: ${exercicio.metaRecorde}` : ""}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {atual.registrado && <p className="text-sm text-muted-foreground">Este exercício já foi salvo.</p>}
                                                <fieldset disabled={enviando || atual.registrado} className="space-y-3">
                                                    {modalidade === "MUSCULACAO" ? (
                                                        <>
                                                            <Campo id={`series-${exercicio.id}`} rotulo={`Séries de ${nome}`} valor={atual.series} onChange={(valor) => alterar(exercicio.id, "series", valor)} />
                                                            <Campo id={`repeticoes-${exercicio.id}`} rotulo={`Repetições de ${nome}`} valor={atual.repeticoes} onChange={(valor) => alterar(exercicio.id, "repeticoes", valor)} />
                                                            <Campo id={`carga-${exercicio.id}`} rotulo={`Carga de ${nome} (kg)`} valor={atual.cargaKg} onChange={(valor) => alterar(exercicio.id, "cargaKg", valor)} />
                                                        </>
                                                    ) : (
                                                        <Campo id={`distancia-${exercicio.id}`} rotulo={`Distância de ${nome} (m)`} valor={atual.distanciaM} onChange={(valor) => alterar(exercicio.id, "distanciaM", valor)} />
                                                    )}
                                                    <Campo id={`tempo-${exercicio.id}`} rotulo={`Tempo de ${nome} (minutos)`} valor={atual.tempoMinutos} onChange={(valor) => alterar(exercicio.id, "tempoMinutos", valor)} />
                                                </fieldset>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                                <Button type="submit" disabled={enviando}>{enviando ? "Salvando…" : "Salvar treino"}</Button>
                            </form>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

function Campo({ id, rotulo, valor, onChange }: { id: string; rotulo: string; valor: string; onChange: (valor: string) => void }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{rotulo}</Label>
            <Input id={id} inputMode="decimal" value={valor} onChange={(event) => onChange(event.target.value)} />
        </div>
    );
}

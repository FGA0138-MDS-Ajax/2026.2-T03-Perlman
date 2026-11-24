import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/http-client";
import { mensagemAutenticacao } from "@/lib/auth-context";
import {
    buscarExerciciosMaisRealizados,
    buscarFrequenciaMedia,
    buscarMetricasRotinas,
    buscarRankingTempo,
    buscarRetencao,
    buscarUsuariosAtivos,
    type ExerciciosMaisRealizados,
    type FrequenciaMedia,
    type MetricasRotinas,
    type Periodo,
    type RankingTempo,
    type Retencao,
    type UsuariosAtivos,
} from "@/lib/api/metricas-api";

type Secao<T> = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; dados: T };

interface Metricas {
    ativos: Secao<UsuariosAtivos>;
    frequencia: Secao<FrequenciaMedia>;
    tempo: Secao<RankingTempo>;
    exercicios: Secao<ExerciciosMaisRealizados>;
    rotinas: Secao<MetricasRotinas>;
    retencao: Secao<Retencao>;
}

const CARREGANDO: Metricas = {
    ativos: { status: "carregando" }, frequencia: { status: "carregando" }, tempo: { status: "carregando" },
    exercicios: { status: "carregando" }, rotinas: { status: "carregando" }, retencao: { status: "carregando" },
};
const LIMITE = 10;

function secao<T>(resultado: PromiseSettledResult<T>): Secao<T> {
    return resultado.status === "fulfilled"
        ? { status: "sucesso", dados: resultado.value }
        : { status: "erro", mensagem: mensagemAutenticacao(resultado.reason) };
}

function formatarDuracao(segundos: number | null | undefined): string {
    if (segundos == null) return "—";
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.round((segundos % 3600) / 60);
    return horas > 0 ? `${horas} h ${minutos} min` : `${minutos} min`;
}

function formatarData(iso: string): string {
    const [ano, mes, dia] = iso.split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : iso;
}

function numero(valor: number | null | undefined, sufixo = ""): string {
    return valor == null ? "—" : `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}${sufixo}`;
}

function BlocoSecao<T>({ titulo, descricao, estado, children }: {
    titulo: string; descricao: string; estado: Secao<T>; children: (dados: T) => ReactNode;
}) {
    return <Card>
        <CardHeader><CardTitle>{titulo}</CardTitle><CardDescription>{descricao}</CardDescription></CardHeader>
        <CardContent className="space-y-4 text-sm">
            {estado.status === "carregando" && <p role="status">Carregando…</p>}
            {estado.status === "erro" && <p role="alert" className="text-destructive">{estado.mensagem}</p>}
            {estado.status === "sucesso" && children(estado.dados)}
        </CardContent>
    </Card>;
}

function Indicadores({ itens }: { itens: [string, string][] }) {
    return <dl className="grid gap-3 sm:grid-cols-3">
        {itens.map(([rotulo, valor]) => <div key={rotulo} className="rounded-lg border p-3">
            <dt className="text-xs text-muted-foreground">{rotulo}</dt>
            <dd className="text-xl font-bold">{valor}</dd>
        </div>)}
    </dl>;
}

export default function PaginaMetricasAdmin() {
    const [de, setDe] = useState("");
    const [ate, setAte] = useState("");
    const [periodo, setPeriodo] = useState<Periodo>({});
    const [tentativa, setTentativa] = useState(0);
    const [metricas, setMetricas] = useState<Metricas>(CARREGANDO);
    const [erroPeriodo, setErroPeriodo] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        setMetricas(CARREGANDO);
        void Promise.allSettled([
            buscarUsuariosAtivos(periodo, signal),
            buscarFrequenciaMedia(periodo, signal),
            buscarRankingTempo({ ...periodo, limite: LIMITE }, signal),
            buscarExerciciosMaisRealizados({ ...periodo, limite: LIMITE }, signal),
            buscarMetricasRotinas({ ...periodo, limite: LIMITE }, signal),
            buscarRetencao({ ate: periodo.ate }, signal),
        ]).then(([ativos, frequencia, tempo, exercicios, rotinas, retencao]) => {
            if (signal.aborted) return;
            const resultados = [ativos, frequencia, tempo, exercicios, rotinas, retencao];
            if (resultados.some((item) => item.status === "rejected" && item.reason instanceof ApiError && item.reason.code === "SESSAO_ALTERADA")) return;
            setMetricas({
                ativos: secao(ativos), frequencia: secao(frequencia), tempo: secao(tempo),
                exercicios: secao(exercicios), rotinas: secao(rotinas), retencao: secao(retencao),
            });
        });
        return () => controller.abort();
    }, [periodo, tentativa]);

    function aplicar(event: FormEvent) {
        event.preventDefault();
        if (de && ate && de > ate) {
            setErroPeriodo("A data inicial deve ser anterior ou igual à data final.");
            return;
        }
        setErroPeriodo("");
        setPeriodo({ de: de || undefined, ate: ate || undefined });
    }

    return <AdminLayout title="Métricas da plataforma">
        <div className="space-y-4">
            <form onSubmit={aplicar} className="flex flex-wrap items-end gap-3" aria-label="Período das métricas">
                <div className="space-y-1.5"><Label htmlFor="metricas-de">De</Label><Input id="metricas-de" type="date" value={de} onChange={(event) => setDe(event.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="metricas-ate">Até</Label><Input id="metricas-ate" type="date" value={ate} onChange={(event) => setAte(event.target.value)} /></div>
                <Button type="submit">Aplicar período</Button>
                <Button type="button" variant="outline" onClick={() => setTentativa((valor) => valor + 1)}>Atualizar dados</Button>
                <p className="w-full text-xs text-muted-foreground">Sem datas, o servidor usa o período padrão (últimos 30 dias).</p>
                {erroPeriodo && <p role="alert" className="w-full text-sm text-destructive">{erroPeriodo}</p>}
            </form>

            <div className="grid gap-4 xl:grid-cols-2">
                <BlocoSecao titulo="Usuários ativos" descricao="Contas com ao menos um registro no período." estado={metricas.ativos}>
                    {(dados) => <>
                        <Indicadores itens={[
                            ["Contas", numero(dados.totalContas)],
                            ["Ativos no período", numero(dados.ativosNoPeriodo)],
                            ["Percentual ativo", numero(dados.percentualAtivos, "%")],
                        ]} />
                        {(dados.serie ?? []).length > 0 && <Table>
                            <TableHeader><TableRow><TableHead>Período</TableHead><TableHead>Usuários ativos</TableHead></TableRow></TableHeader>
                            <TableBody>{dados.serie.map((ponto) => <TableRow key={ponto.periodo}>
                                <TableCell>{formatarData(ponto.periodo)}</TableCell><TableCell>{ponto.ativos}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                    </>}
                </BlocoSecao>

                <BlocoSecao titulo="Frequência média" descricao="Dias distintos com treino por usuário e semana." estado={metricas.frequencia}>
                    {(dados) => <>
                        <Indicadores itens={[
                            ["Média (dias/semana)", numero(dados.mediaDiasPorSemana)],
                            ["Mediana (dias/semana)", numero(dados.medianaDiasPorSemana)],
                        ]} />
                        {dados.distribuicao.length > 0 && <Table>
                            <TableHeader><TableRow><TableHead>Faixa</TableHead><TableHead>Usuários</TableHead></TableRow></TableHeader>
                            <TableBody>{dados.distribuicao.map((item) => <TableRow key={item.faixa}><TableCell>{item.faixa}</TableCell><TableCell>{item.usuarios}</TableCell></TableRow>)}</TableBody>
                        </Table>}
                    </>}
                </BlocoSecao>

                <BlocoSecao titulo="Tempo de treino" descricao="Totais e valores por usuário ativo, sem identificar ninguém." estado={metricas.tempo}>
                    {(dados) => <>
                        <Indicadores itens={[
                            ["Tempo total", formatarDuracao(dados.tempoTotalS)],
                            ["Média por usuário ativo", formatarDuracao(dados.mediaPorUsuarioAtivoS)],
                            ["Mediana por usuário ativo", formatarDuracao(dados.medianaPorUsuarioAtivoS)],
                        ]} />
                    </>}
                </BlocoSecao>

                <BlocoSecao titulo="Exercícios mais realizados" descricao="Ranking por exercício do catálogo." estado={metricas.exercicios}>
                    {(dados) => <>
                        {dados.ranking.length === 0 ? <p>Nenhuma execução no período.</p> : <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Exercício</TableHead><TableHead>Execuções</TableHead><TableHead>Usuários</TableHead></TableRow></TableHeader>
                            <TableBody>{dados.ranking.map((item) => <TableRow key={item.catalogoId}>
                                <TableCell>{item.posicao}</TableCell><TableCell>{item.nome}</TableCell>
                                <TableCell>{item.execucoes}</TableCell><TableCell>{item.usuariosDistintos}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                        {dados.suprimidos > 0 && <p className="text-xs text-muted-foreground">{dados.suprimidos} exercício(s) omitido(s) por privacidade.</p>}
                    </>}
                </BlocoSecao>

                <BlocoSecao titulo="Rotinas" descricao="Treinos cadastrados e adições de treinos públicos." estado={metricas.rotinas}>
                    {(dados) => <>
                        <Indicadores itens={[
                            ["Treinos ativos", numero(dados.treinosAtivos)],
                            ["Treinos públicos", numero(dados.percentualTreinosPublicos, "%")],
                            ["Registros com treino", numero(dados.percentualRegistrosComTreino, "%")],
                        ]} />
                        {dados.porTipo.length > 0 && <p className="text-muted-foreground">
                            {dados.porTipo.map((item) => `${item.tipo === "MUSCULACAO" ? "Musculação" : item.tipo === "AEROBICO" ? "Aeróbico" : item.tipo}: ${item.treinos}`).join(" · ")}
                        </p>}
                        {dados.treinosPublicosMaisAdicionados.length === 0 ? <p>Nenhum treino público foi adicionado no período.</p> : <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Treino</TableHead><TableHead>Adições</TableHead><TableHead>Usuários</TableHead></TableRow></TableHeader>
                            <TableBody>{dados.treinosPublicosMaisAdicionados.map((item) => <TableRow key={item.treinoId}>
                                <TableCell>{item.posicao}</TableCell><TableCell>{item.nome}</TableCell>
                                <TableCell>{item.adicoes}</TableCell><TableCell>{item.usuariosDistintos}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                    </>}
                </BlocoSecao>

                <BlocoSecao titulo="Retenção" descricao="Coortes semanais de cadastro." estado={metricas.retencao}>
                    {(dados) => <>
                        <Indicadores itens={[
                            ["Ativação em 7 dias", numero(dados.taxaAtivacao7Dias, "%")],
                            ["Mediana até o 1º registro", dados.medianaDiasAtePrimeiroRegistro == null ? "—" : `${dados.medianaDiasAtePrimeiroRegistro} dia(s)`],
                        ]} />
                        {dados.coortes.length === 0 ? <p className="text-muted-foreground">Ainda não há coortes calculadas.</p> : <Table>
                            <TableHeader><TableRow>
                                <TableHead>Semana de cadastro</TableHead><TableHead>Cadastros</TableHead>
                                <TableHead>Ativos em 7 dias</TableHead><TableHead>Retidos na 2ª semana</TableHead><TableHead>Retidos na 5ª semana</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>{dados.coortes.map((coorte) => <TableRow key={coorte.semana}>
                                <TableCell>{formatarData(coorte.semana)}</TableCell><TableCell>{coorte.cadastrados}</TableCell>
                                <TableCell>{coorte.ativados7Dias}</TableCell><TableCell>{coorte.retidosSemana2}</TableCell><TableCell>{coorte.retidosSemana5}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                        <p className="text-xs text-muted-foreground">Semanas que ainda não terminaram aparecem com zero retidos.</p>
                    </>}
                </BlocoSecao>
            </div>
        </div>
    </AdminLayout>;
}

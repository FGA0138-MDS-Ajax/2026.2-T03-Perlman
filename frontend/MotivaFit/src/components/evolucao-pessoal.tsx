import { useEffect, useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/http-client";
import { mensagemAutenticacao } from "@/lib/auth-context";
import { listarCatalogoExercicios } from "@/lib/api/catalogo-exercicios-api";
import { buscarEvolucao, type Agrupamento, type EvolucaoPonto } from "@/lib/api/metricas-api";
import type { CatalogoExercicioResponseDTO } from "@/lib/api/contracts";

type Indicador = "execucoes" | "cargaMaxKg" | "volumeKg" | "tempoTotalS" | "distanciaTotalM" | "paceSegPorKm";

const INDICADORES: { valor: Indicador; rotulo: string; formatar: (valor: number) => string }[] = [
    { valor: "execucoes", rotulo: "Execuções", formatar: (v) => String(v) },
    { valor: "cargaMaxKg", rotulo: "Carga máxima (kg)", formatar: (v) => `${v.toLocaleString("pt-BR")} kg` },
    { valor: "volumeKg", rotulo: "Volume (kg)", formatar: (v) => `${v.toLocaleString("pt-BR")} kg` },
    { valor: "tempoTotalS", rotulo: "Tempo total", formatar: (v) => `${Math.round(v / 60)} min` },
    { valor: "distanciaTotalM", rotulo: "Distância (m)", formatar: (v) => `${v.toLocaleString("pt-BR")} m` },
    { valor: "paceSegPorKm", rotulo: "Pace (min/km)", formatar: (v) => `${Math.floor(v / 60)}:${String(Math.round(v % 60)).padStart(2, "0")} /km` },
];

const AGRUPAMENTOS: { valor: Agrupamento; rotulo: string }[] = [
    { valor: "DIA", rotulo: "Dia" }, { valor: "SEMANA", rotulo: "Semana" }, { valor: "MES", rotulo: "Mês" },
];

interface Filtros { catalogoId?: number; de?: string; ate?: string; agrupamento: Agrupamento }

type Estado = { status: "carregando" } | { status: "erro"; mensagem: string } | { status: "sucesso"; pontos: EvolucaoPonto[] };

/** Série da evolução pessoal (GET /api/metricas/evolucao), agregada pelo servidor. */
export default function EvolucaoPessoal() {
    const [catalogo, setCatalogo] = useState<CatalogoExercicioResponseDTO[]>([]);
    const [catalogoId, setCatalogoId] = useState("");
    const [de, setDe] = useState("");
    const [ate, setAte] = useState("");
    const [agrupamento, setAgrupamento] = useState<Agrupamento>("SEMANA");
    const [indicador, setIndicador] = useState<Indicador>("execucoes");
    const [filtros, setFiltros] = useState<Filtros>({ agrupamento: "SEMANA" });
    const [estado, setEstado] = useState<Estado>({ status: "carregando" });
    const [tentativa, setTentativa] = useState(0);
    const [erroFiltro, setErroFiltro] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        listarCatalogoExercicios(controller.signal).then(setCatalogo, () => { /* filtro opcional */ });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setEstado({ status: "carregando" });
        buscarEvolucao(filtros, controller.signal).then(
            (pontos) => { if (!controller.signal.aborted) setEstado({ status: "sucesso", pontos }); },
            (error: unknown) => {
                if (controller.signal.aborted || error instanceof ApiError && error.code === "SESSAO_ALTERADA") return;
                setEstado({ status: "erro", mensagem: mensagemAutenticacao(error) });
            },
        );
        return () => controller.abort();
    }, [filtros, tentativa]);

    function aplicar(event: FormEvent) {
        event.preventDefault();
        if (de && ate && de > ate) {
            setErroFiltro("A data inicial deve ser anterior ou igual à data final.");
            return;
        }
        setErroFiltro("");
        setFiltros({ catalogoId: catalogoId ? Number(catalogoId) : undefined, de: de || undefined, ate: ate || undefined, agrupamento });
    }

    const definicao = INDICADORES.find((item) => item.valor === indicador)!;
    const pontos = estado.status === "sucesso"
        ? estado.pontos.filter((ponto) => typeof ponto[indicador] === "number")
        : [];
    const maximo = Math.max(1, ...pontos.map((ponto) => ponto[indicador] as number));

    return <Card className="shadow-sm">
        <CardHeader>
            <CardTitle className="text-lg font-heading">Minha evolução</CardTitle>
            <CardDescription>Seus registros agregados por período. Sem datas, o servidor usa o período padrão.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <form onSubmit={aplicar} aria-label="Filtros da evolução" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
                <div className="space-y-1.5">
                    <Label htmlFor="evolucao-exercicio">Exercício</Label>
                    <select id="evolucao-exercicio" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={catalogoId} onChange={(event) => setCatalogoId(event.target.value)}>
                        <option value="">Todos</option>
                        {catalogo.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5"><Label htmlFor="evolucao-de">De</Label><Input id="evolucao-de" type="date" value={de} onChange={(event) => setDe(event.target.value)} /></div>
                <div className="space-y-1.5"><Label htmlFor="evolucao-ate">Até</Label><Input id="evolucao-ate" type="date" value={ate} onChange={(event) => setAte(event.target.value)} /></div>
                <div className="space-y-1.5">
                    <Label htmlFor="evolucao-agrupamento">Agrupar por</Label>
                    <select id="evolucao-agrupamento" className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={agrupamento} onChange={(event) => setAgrupamento(event.target.value as Agrupamento)}>
                        {AGRUPAMENTOS.map((item) => <option key={item.valor} value={item.valor}>{item.rotulo}</option>)}
                    </select>
                </div>
                <Button type="submit">Aplicar</Button>
                {erroFiltro && <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-5">{erroFiltro}</p>}
            </form>

            <div role="group" aria-label="Indicador" className="flex flex-wrap gap-2">
                {INDICADORES.map((item) => <Button key={item.valor} type="button" size="sm"
                    variant={indicador === item.valor ? "secondary" : "outline"} aria-pressed={indicador === item.valor}
                    onClick={() => setIndicador(item.valor)}>{item.rotulo}</Button>)}
            </div>

            {estado.status === "carregando" && <p role="status" className="text-sm">Carregando evolução…</p>}
            {estado.status === "erro" && <div className="space-y-2">
                <p role="alert" className="text-sm text-destructive">{estado.mensagem}</p>
                <Button type="button" variant="outline" onClick={() => setTentativa((valor) => valor + 1)}>Tentar carregar evolução novamente</Button>
            </div>}
            {estado.status === "sucesso" && (pontos.length === 0
                ? <p className="text-sm text-muted-foreground">Sem dados de {definicao.rotulo.toLowerCase()} no período.</p>
                : <table className="w-full text-sm">
                    <caption className="sr-only">{definicao.rotulo} por período</caption>
                    <thead><tr className="text-left text-xs text-muted-foreground">
                        <th className="py-1 pr-2 font-medium">Período</th>
                        <th className="py-1 pr-2 font-medium">Exercício</th>
                        <th className="w-1/2 py-1 font-medium">{definicao.rotulo}</th>
                    </tr></thead>
                    <tbody>{pontos.map((ponto) => {
                        const valor = ponto[indicador] as number;
                        return <tr key={`${ponto.periodo}-${ponto.catalogoId ?? "todos"}`} className="border-t">
                            <td className="py-1.5 pr-2 whitespace-nowrap">{ponto.periodo}</td>
                            <td className="py-1.5 pr-2">{ponto.exercicioNome ?? "Todos"}</td>
                            <td className="py-1.5">
                                <div className="flex items-center gap-2">
                                    <div aria-hidden="true" className="h-2.5 rounded-full bg-primary" style={{ width: `${Math.max(2, (valor / maximo) * 100)}%` }} />
                                    <span className="whitespace-nowrap tabular-nums">{definicao.formatar(valor)}</span>
                                </div>
                            </td>
                        </tr>;
                    })}</tbody>
                </table>)}
        </CardContent>
    </Card>;
}

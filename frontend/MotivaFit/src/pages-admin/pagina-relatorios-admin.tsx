import { useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EstadoConsultaAdmin, formatarPercentual, rotuloModalidade } from "@/components/consulta-admin";
import { buscarRelatorioAdmin, type RelatorioAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";

/** Linhas indicador/valor do relatório, sem nenhum dado que identifique usuários. */
export function linhasRelatorio(dados: RelatorioAdmin): (string | number)[][] {
    const { resumo, exercicios, rotinas } = dados;
    return [
        ["indicador", "valor"],
        ["Contas cadastradas", resumo.totalUsuarios],
        ["Usuários ativos no período", resumo.usuariosAtivos],
        ["Percentual de contas ativas", resumo.percentualAtivos ?? ""],
        ["Treinos ativos", resumo.treinosAtivos],
        ["Percentual de treinos públicos", rotinas.percentualTreinosPublicos ?? ""],
        ["Percentual de registros com treino", rotinas.percentualRegistrosComTreino ?? ""],
        ...rotinas.porTipo.map((item) => [`Treinos de ${rotuloModalidade(item.tipo)}`, item.treinos]),
        ...exercicios.ranking.map((item) => [`Execuções de ${item.nome}`, item.execucoes]),
    ];
}

export default function PaginaRelatoriosAdmin() {
    const { estado, atualizar } = useConsultaAdmin(buscarRelatorioAdmin);
    const [erroExportacao, setErroExportacao] = useState("");

    function exportarCsv(dados: RelatorioAdmin) {
        setErroExportacao("");
        try {
            const csv = linhasRelatorio(dados)
                .map((linha) => linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(",")).join("\n");
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = "metricas-motivafit.csv";
            link.click();
            URL.revokeObjectURL(url);
        } catch {
            setErroExportacao("Não foi possível exportar o relatório.");
        }
    }

    return <AdminLayout title="Relatórios de Desempenho">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <>
                <Card>
                    <CardHeader>
                        <CardTitle>Métricas gerais de uso</CardTitle>
                        <CardDescription>Valores agregados dos últimos 30 dias, sem identificar usuários. Cada execução é um exercício registrado, não uma sessão de treino. Para outros períodos, use <Link to="/admin/metricas" className="underline">Métricas</Link>.</CardDescription>
                        <div className="pt-2"><Button type="button" variant="outline" onClick={() => exportarCsv(estado.dados)}>Exportar métricas (CSV)</Button></div>
                        {erroExportacao && <p role="alert" className="text-sm text-destructive">{erroExportacao}</p>}
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {([
                            ["Contas cadastradas", String(estado.dados.resumo.totalUsuarios)],
                            ["Usuários ativos no período", String(estado.dados.resumo.usuariosAtivos)],
                            ["Contas ativas", formatarPercentual(estado.dados.resumo.percentualAtivos)],
                            ["Treinos ativos", String(estado.dados.resumo.treinosAtivos)],
                            ["Treinos públicos", formatarPercentual(estado.dados.rotinas.percentualTreinosPublicos)],
                            ["Registros vinculados a um treino", formatarPercentual(estado.dados.rotinas.percentualRegistrosComTreino)],
                        ] as const).map(([titulo, valor]) => <div key={titulo} className="rounded-lg border p-4"><span className="text-sm text-muted-foreground">{titulo}</span><div className="text-2xl font-bold">{valor}</div></div>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Exercícios mais realizados</CardTitle>
                        <CardDescription>Exercícios praticados por poucas pessoas são omitidos para preservar a privacidade.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {estado.dados.exercicios.ranking.length === 0 ? <p>Nenhuma execução no período.</p> : <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Exercício</TableHead><TableHead>Modalidade</TableHead><TableHead>Execuções</TableHead><TableHead>Pessoas</TableHead></TableRow></TableHeader>
                            <TableBody>{estado.dados.exercicios.ranking.map((item) => <TableRow key={item.catalogoId}>
                                <TableCell>{item.posicao}</TableCell><TableCell>{item.nome}</TableCell><TableCell>{rotuloModalidade(item.modalidade)}</TableCell>
                                <TableCell>{item.execucoes}</TableCell><TableCell>{item.usuariosDistintos}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                        {estado.dados.exercicios.suprimidos > 0 && <p className="text-xs text-muted-foreground">{estado.dados.exercicios.suprimidos} exercício(s) omitido(s) por privacidade.</p>}
                    </CardContent>
                </Card>
            </>}
        </EstadoConsultaAdmin>
    </AdminLayout>;
}

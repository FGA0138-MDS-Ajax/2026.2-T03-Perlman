import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoConsultaAdmin, PaginacaoAdmin } from "@/components/consulta-admin";
import { buscarRelatorioAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";
import { Button } from "@/components/ui/button";
import { exportarContas } from "@/lib/api/conta-api";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function PaginaRelatoriosAdmin() {
    const { estado, pagina, setPagina, atualizar } = useConsultaAdmin(buscarRelatorioAdmin);
    const [exportando, setExportando] = useState(false);
    const [erroExportacao, setErroExportacao] = useState("");

    async function exportarCsv() {
        setExportando(true);
        setErroExportacao("");
        try {
            const contas = await exportarContas();
            const linhas = [
                ["id", "email", "perfil", "ativo"],
                ...contas.map((conta) => [conta.id, conta.email, conta.perfil, conta.ativo]),
            ];
            const csv = linhas.map((linha) => linha.map((valor) => `"${String(valor).replaceAll('"', '""')}"`).join(",")).join("\n");
            const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            const link = document.createElement("a");
            link.href = url;
            link.download = "contas-motivafit.csv";
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            setErroExportacao(error instanceof Error ? error.message : "Não foi possível exportar as contas.");
        } finally {
            setExportando(false);
        }
    }

    return <AdminLayout title="Relatórios de Desempenho">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <>
                <Card><CardHeader><CardTitle>Relatórios e Métricas de Uso</CardTitle>
                    <CardDescription>Dados de todas as contas. Cada execução representa um exercício registrado, não uma sessão de treino.</CardDescription>
                    <div className="pt-2"><Button type="button" variant="outline" onClick={() => void exportarCsv()} disabled={exportando}>{exportando ? "Exportando…" : "Exportar contas"}</Button></div>
                    {erroExportacao && <p role="alert" className="text-sm text-destructive">{erroExportacao}</p>}
                </CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                            ["Usuários cadastrados", estado.dados.resumo.totalUsuarios],
                            ["Execuções nos exercícios mais realizados", estado.dados.resumo.execucoesTopExercicios],
                            ["Treinos ativos", estado.dados.resumo.treinosAtivos],
                            ["Usuários ativos no período", estado.dados.resumo.usuariosAtivos],
                    ].map(([titulo, valor]) => <div key={titulo} className="rounded-lg border p-4"><span>{titulo}</span><div className="text-2xl font-bold">{valor}</div></div>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Contas cadastradas</CardTitle><CardDescription>Dados exportados pela API. Para frequência, retenção e rankings, consulte <Link to="/admin/metricas" className="underline">Métricas</Link>.</CardDescription></CardHeader>
                    <CardContent>{estado.dados.usuarios.length === 0 ? <p>Nenhum usuário encontrado.</p> : <Table>
                        <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Perfil</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>{estado.dados.usuarios.map((item) => <TableRow key={item.id}>
                            <TableCell>{item.email}</TableCell><TableCell>{item.perfil}</TableCell><TableCell>{item.ativo ? "Ativo" : "Inativo"}</TableCell>
                        </TableRow>)}</TableBody>
                    </Table>}</CardContent>
                </Card>
                <PaginacaoAdmin pagina={pagina} total={estado.dados.resumo.totalUsuarios} setPagina={setPagina} />
            </>}
        </EstadoConsultaAdmin>
    </AdminLayout>;
}

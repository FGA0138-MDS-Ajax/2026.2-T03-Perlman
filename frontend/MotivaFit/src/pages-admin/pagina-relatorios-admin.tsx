import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoConsultaAdmin, PaginacaoAdmin } from "@/components/consulta-admin";
import { buscarRelatorioAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";

export default function PaginaRelatoriosAdmin() {
    const { estado, pagina, setPagina, atualizar } = useConsultaAdmin(buscarRelatorioAdmin);
    return <AdminLayout title="Relatórios de Desempenho">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <>
                <Card><CardHeader><CardTitle>Relatórios e Métricas de Uso</CardTitle>
                    <CardDescription>Dados de todas as contas. Cada execução representa um exercício registrado, não uma sessão de treino.</CardDescription>
                </CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ["Usuários cadastrados", estado.dados.resumo.totalUsuarios],
                        ["Execuções registradas", estado.dados.resumo.totalExecucoes],
                        ["Fichas vinculadas", estado.dados.resumo.totalFichas],
                        ["Usuários ativos (30 dias)", estado.dados.resumo.usuariosAtivos30Dias],
                    ].map(([titulo, valor]) => <div key={titulo} className="rounded-lg border p-4"><span>{titulo}</span><div className="text-2xl font-bold">{valor}</div></div>)}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Atividade por usuário</CardTitle><CardDescription>Fichas atuais e histórico de execuções, incluindo contas sem atividade.</CardDescription></CardHeader>
                    <CardContent>{estado.dados.usuarios.length === 0 ? <p>Nenhum usuário encontrado.</p> : <Table>
                        <TableHeader><TableRow><TableHead>Usuário</TableHead><TableHead>Status</TableHead><TableHead>Fichas vinculadas</TableHead><TableHead>Execuções</TableHead><TableHead>Última execução</TableHead></TableRow></TableHeader>
                        <TableBody>{estado.dados.usuarios.map((item) => <TableRow key={item.id}>
                            <TableCell>{item.email}</TableCell><TableCell>{item.ativo ? "Ativo" : "Inativo"}</TableCell><TableCell>{item.fichas}</TableCell><TableCell>{item.execucoes}</TableCell>
                            <TableCell>{item.ultimaExecucao ? new Date(item.ultimaExecucao).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "Nenhuma"}</TableCell>
                        </TableRow>)}</TableBody>
                    </Table>}</CardContent>
                </Card>
                <PaginacaoAdmin pagina={pagina} total={estado.dados.resumo.totalUsuarios} setPagina={setPagina} />
            </>}
        </EstadoConsultaAdmin>
    </AdminLayout>;
}

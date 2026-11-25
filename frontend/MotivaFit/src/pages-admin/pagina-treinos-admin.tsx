import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoConsultaAdmin, formatarPercentual, rotuloModalidade } from "@/components/consulta-admin";
import { buscarRelatorioAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";

/** Visão agregada dos treinos: totais e adesão aos treinos públicos, sem listar treinos de usuários. */
export default function PaginaTreinosAdmin() {
    const { estado, atualizar } = useConsultaAdmin(buscarRelatorioAdmin);
    return <AdminLayout title="Treinos da Plataforma">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <>
                <Card>
                    <CardHeader>
                        <CardTitle>Visão geral dos treinos</CardTitle>
                        <CardDescription>Totais de todas as contas, sem exibir treinos ou donos individualmente.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {([
                            ["Treinos ativos", String(estado.dados.rotinas.treinosAtivos)],
                            ...estado.dados.rotinas.porTipo.map((item) => [`Treinos de ${rotuloModalidade(item.tipo)}`, String(item.treinos)] as const),
                            ["Treinos públicos", formatarPercentual(estado.dados.rotinas.percentualTreinosPublicos)],
                            ["Registros vinculados a um treino", formatarPercentual(estado.dados.rotinas.percentualRegistrosComTreino)],
                        ] as const).map(([titulo, valor]) => <div key={titulo} className="rounded-lg border p-4"><span className="text-sm text-muted-foreground">{titulo}</span><div className="text-2xl font-bold">{valor}</div></div>)}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Treinos públicos mais adicionados</CardTitle>
                        <CardDescription>Treinos públicos copiados por outras pessoas nos últimos 30 dias.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {estado.dados.rotinas.treinosPublicosMaisAdicionados.length === 0 ? <p>Nenhum treino público foi adicionado no período.</p> : <Table>
                            <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Treino</TableHead><TableHead>Adições</TableHead><TableHead>Pessoas</TableHead></TableRow></TableHeader>
                            <TableBody>{estado.dados.rotinas.treinosPublicosMaisAdicionados.map((item) => <TableRow key={item.treinoId}>
                                <TableCell>{item.posicao}</TableCell><TableCell>{item.nome}</TableCell>
                                <TableCell>{item.adicoes}</TableCell><TableCell>{item.usuariosDistintos}</TableCell>
                            </TableRow>)}</TableBody>
                        </Table>}
                    </CardContent>
                </Card>
            </>}
        </EstadoConsultaAdmin>
    </AdminLayout>;
}

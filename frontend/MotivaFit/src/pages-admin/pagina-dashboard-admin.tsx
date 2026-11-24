import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoConsultaAdmin } from "@/components/consulta-admin";
import { buscarRelatorioAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";

export default function PaginaDashboardAdmin() {
    const { isSuperusuario } = useAuth();
    const { estado, atualizar } = useConsultaAdmin(buscarRelatorioAdmin);
    return <AdminLayout title="Dashboard Geral">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    ["Execuções nos exercícios mais realizados", estado.dados.resumo.execucoesTopExercicios, "Soma das execuções dos exercícios do ranking no período (não é o total da plataforma)."],
                    ["Usuários ativos no período", estado.dados.resumo.usuariosAtivos, estado.dados.resumo.percentualAtivos === null ? "Usuários com registros no período analisado." : `${estado.dados.resumo.percentualAtivos}% das contas tiveram registros no período.`],
                    ["Treinos ativos", estado.dados.resumo.treinosAtivos, "Treinos não excluídos salvos nas contas."],
                    ["Usuários cadastrados", estado.dados.resumo.totalUsuarios, "Contas registradas na plataforma."],
                ].map(([titulo, valor, descricao]) => <Card key={titulo}>
                    <CardHeader><CardDescription>{titulo}</CardDescription></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{valor}</div><p className="mt-1 text-xs text-muted-foreground">{descricao}</p></CardContent>
                </Card>)}
            </section>}
        </EstadoConsultaAdmin>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
                { titulo: "Treinos", descricao: "Consulte as fichas vinculadas aos usuários.", to: "/admin/treinos" },
                { titulo: "Catálogo", descricao: "Cadastre e mantenha os exercícios disponíveis.", to: "/admin/catalogo" },
                { titulo: "Relatórios", descricao: "Consulte as contas e os totais da plataforma.", to: "/admin/relatorios" },
                { titulo: "Métricas", descricao: "Frequência, retenção, tempo de treino e rankings por período.", to: "/admin/metricas" },
                ...(isSuperusuario ? [{ titulo: "SuperUsuário", descricao: "Gerencie convites para administradores.", to: "/admin/superusuario" }] : []),
            ].map((item) => <Link key={item.to} to={item.to}><Card className="h-full"><CardHeader><CardTitle>{item.titulo}</CardTitle><CardDescription>{item.descricao}</CardDescription></CardHeader></Card></Link>)}
        </section>
    </AdminLayout>;
}

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
                    ["Execuções registradas", estado.dados.resumo.totalExecucoes, "Exercícios executados em toda a plataforma, não sessões de treino."],
                    ["Usuários com fichas", estado.dados.resumo.usuariosComFichas, "Usuários com pelo menos uma ficha vinculada."],
                    ["Fichas vinculadas", estado.dados.resumo.totalFichas, "Treinos não excluídos salvos nas contas."],
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
                { titulo: "Relatórios", descricao: "Consulte a atividade dos usuários e os totais da plataforma.", to: "/admin/relatorios" },
                ...(isSuperusuario ? [{ titulo: "SuperUsuário", descricao: "Gerencie convites para administradores.", to: "/admin/superusuario" }] : []),
            ].map((item) => <Link key={item.to} to={item.to}><Card className="h-full"><CardHeader><CardTitle>{item.titulo}</CardTitle><CardDescription>{item.descricao}</CardDescription></CardHeader></Card></Link>)}
        </section>
    </AdminLayout>;
}

import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoConsultaAdmin, PaginacaoAdmin } from "@/components/consulta-admin";
import { listarTreinosAdmin } from "@/lib/api/admin-api";
import { useConsultaAdmin } from "@/lib/use-consulta-admin";

export default function PaginaTreinosAdmin() {
    const { estado, pagina, setPagina, atualizar } = useConsultaAdmin(listarTreinosAdmin);
    return <AdminLayout title="Gerenciamento de Treinos">
        <EstadoConsultaAdmin estado={estado} atualizar={atualizar}>
            {estado.status === "sucesso" && <>
                <p>{estado.dados.total} fichas vinculadas na plataforma.</p>
                {estado.dados.itens.length === 0 && <p>Nenhuma ficha encontrada.</p>}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {estado.dados.itens.map((ficha) => <Card key={ficha.id}>
                        <CardHeader><CardTitle>{ficha.nome}</CardTitle><CardDescription>{ficha.usuarioEmail}</CardDescription></CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p>Modalidade: {ficha.tipo === "MUSCULACAO" ? "Musculação" : "Aeróbico"}</p>
                            <p>Visibilidade: {ficha.visibilidade === "PUBLICO" ? "Pública" : "Privada"}</p>
                        </CardContent>
                    </Card>)}
                </div>
                <PaginacaoAdmin pagina={pagina} total={estado.dados.total} setPagina={setPagina} />
            </>}
        </EstadoConsultaAdmin>
    </AdminLayout>;
}

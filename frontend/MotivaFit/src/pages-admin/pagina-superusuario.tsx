import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaginaSuperUsuario() {
    return <AdminLayout title="SuperUsuário">
        <Card>
            <CardHeader><CardTitle>Convites para administradores</CardTitle></CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    A emissão e o aceite de convites estarão disponíveis em breve.
                </p>
            </CardContent>
        </Card>
    </AdminLayout>;
}

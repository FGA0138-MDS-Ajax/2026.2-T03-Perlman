import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getWorkoutHistory } from "@/lib/workout-history";
import { getWorkoutEnrollments } from "@/lib/workout-enrollments";
import { Activity, Dumbbell, FileText, Plus, Search, Settings, Trash2 } from "lucide-react";

interface UsuarioAdmin {
    id: string;
    nome: string;
    email: string;
    status: "Ativo" | "Inativo";
    dataCadastro: string;
}

export default function PaginaDashboardAdmin() {
    const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
    const [mostrarModalNovo, setMostrarModalNovo] = useState(false);
    const [novoNome, setNovoNome] = useState("");
    const [novoEmail, setNovoEmail] = useState("");
    const [novoStatus, setNovoStatus] = useState<"Ativo" | "Inativo">("Ativo");
    const historico = getWorkoutHistory();
    const inscricoes = getWorkoutEnrollments();
    const usuariosFiltrados = usuarios.filter((usuario) => {
        const termo = busca.toLowerCase();
        const correspondeBusca =
            usuario.nome.toLowerCase().includes(termo) ||
            usuario.email.toLowerCase().includes(termo);
        return correspondeBusca && (filtroStatus === "Todos" || usuario.status === filtroStatus);
    });
    const totalAlunosInscritos = new Set(
        inscricoes.map((inscricao) => inscricao.userEmail.trim().toLowerCase())
    ).size;

    function handleAdicionarUsuario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!novoNome.trim() || !novoEmail.trim()) return;

        const novoUsuario: UsuarioAdmin = {
            id: Date.now().toString(),
            nome: novoNome.trim(),
            email: novoEmail.trim().toLowerCase(),
            status: novoStatus,
            dataCadastro: new Date().toLocaleDateString("pt-BR"),
        };
        setUsuarios((atuais) => [novoUsuario, ...atuais]);
        setNovoNome("");
        setNovoEmail("");
        setNovoStatus("Ativo");
        setMostrarModalNovo(false);
    }

    function alternarStatus(id: string) {
        setUsuarios((atuais) =>
            atuais.map((usuario) =>
                usuario.id === id
                    ? { ...usuario, status: usuario.status === "Ativo" ? "Inativo" : "Ativo" }
                    : usuario
            )
        );
    }

    const atalhos = [
        {
            title: "Treinos",
            description: `${inscricoes.length} inscrições atuais em fichas`,
            to: "/admin/treinos",
            icon: Dumbbell,
        },
        {
            title: "Relatórios",
            description: `${totalAlunosInscritos} alunos inscritos identificados`,
            to: "/admin/relatorios",
            icon: FileText,
        },
        {
            title: "SuperUsuário",
            description: "Gerencie os e-mails autorizados como admins",
            to: "/admin/superusuario",
            icon: Settings,
        },
    ];

    return (
        <AdminLayout title="Dashboard Geral">
            <section className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Treinos realizados</CardDescription>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{historico.length}</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Total de conclusões registradas neste navegador
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardDescription>Alunos inscritos em fichas</CardDescription>
                        <Dumbbell className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalAlunosInscritos}</div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Alunos únicos com inscrição registrada
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {atalhos.map(({ title, description, to, icon: Icon }) => (
                    <Link key={to} to={to} className="block">
                        <Card className="h-full transition-shadow hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{title}</CardTitle>
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <CardDescription>{description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </section>

            <Card>
                <CardHeader>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <CardTitle>Usuários da Plataforma</CardTitle>
                            <CardDescription>Gerencie os alunos cadastrados no painel.</CardDescription>
                        </div>
                        <Button onClick={() => setMostrarModalNovo(true)} className="gap-1.5">
                            <Plus className="h-4 w-4" />
                            Adicionar Usuário
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou e-mail..."
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {(["Todos", "Ativo", "Inativo"] as const).map((status) => (
                                <Button
                                    key={status}
                                    variant={filtroStatus === status ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => setFiltroStatus(status)}
                                >
                                    {status === "Ativo" ? "Ativos" : status === "Inativo" ? "Inativos" : status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {usuariosFiltrados.length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            Nenhum usuário encontrado com os filtros aplicados.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>E-mail</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Data de Cadastro</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuariosFiltrados.map((usuario) => (
                                        <TableRow key={usuario.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="h-7 w-7 text-xs">
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {usuario.nome.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {usuario.nome}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={usuario.status === "Ativo" ? "default" : "secondary"}
                                                    className={usuario.status === "Ativo" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                                >
                                                    {usuario.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{usuario.dataCadastro}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => alternarStatus(usuario.id)}
                                                    >
                                                        {usuario.status === "Ativo" ? "Desativar" : "Ativar"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() =>
                                                            setUsuarios((atuais) =>
                                                                atuais.filter((item) => item.id !== usuario.id)
                                                            )
                                                        }
                                                        title="Remover usuário"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {mostrarModalNovo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Adicionar Novo Usuário</CardTitle>
                            <CardDescription>Cadastre um aluno ou instrutor no MotivaFit.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAdicionarUsuario}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="novo-nome">Nome Completo</Label>
                                    <Input
                                        id="novo-nome"
                                        value={novoNome}
                                        onChange={(event) => setNovoNome(event.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="novo-email">E-mail</Label>
                                    <Input
                                        id="novo-email"
                                        type="email"
                                        value={novoEmail}
                                        onChange={(event) => setNovoEmail(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="novo-status">Status Inicial</Label>
                                    <select
                                        id="novo-status"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={novoStatus}
                                        onChange={(event) =>
                                            setNovoStatus(event.target.value as "Ativo" | "Inativo")
                                        }
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </div>
                            </CardContent>
                            <div className="flex justify-end gap-2 p-6 pt-0">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setMostrarModalNovo(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Cadastrar</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}

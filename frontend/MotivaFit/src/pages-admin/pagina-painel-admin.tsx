import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate, Link } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    FileText,
    Settings,
    LogOut,
    Plus,
    Search,
    Trash2,
    CheckCircle,
    XCircle,
    Activity,
    ExternalLink
} from "lucide-react";

interface Usuario {
    id: string;
    nome: string;
    email: string;
    status: "Ativo" | "Inativo";
    dataCadastro: string;
}

export default function PaginaPainelAdmin() {
    const navigate = useNavigate();
    const [secaoAtiva, setSecaoAtiva] = useState<"dashboard" | "usuarios" | "treinos" | "relatorios" | "config">("dashboard");

    // Lista de usuários com estado para permitir adicionar, filtrar e alterar status
    const [usuarios, setUsuarios] = useState<Usuario[]>([
        { id: "1", nome: "João Silva", email: "joao@email.com", status: "Ativo", dataCadastro: "25/10/2026" },
        { id: "2", nome: "Maria Santos", email: "maria@email.com", status: "Ativo", dataCadastro: "24/10/2026" },
        { id: "3", nome: "Pedro Oliveira", email: "pedro@email.com", status: "Inativo", dataCadastro: "22/10/2026" },
        { id: "4", nome: "Ana Beatriz", email: "ana.beatriz@email.com", status: "Ativo", dataCadastro: "20/10/2026" },
        { id: "5", nome: "Lucas Souza", email: "lucas.souza@email.com", status: "Ativo", dataCadastro: "18/10/2026" }
    ]);

    // Estados para filtro e busca
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState<"Todos" | "Ativo" | "Inativo">("Todos");

    // Estado do formulário de novo usuário
    const [mostrarModalNovo, setMostrarModalNovo] = useState(false);
    const [novoNome, setNovoNome] = useState("");
    const [novoEmail, setNovoEmail] = useState("");
    const [novoStatus, setNovoStatus] = useState<"Ativo" | "Inativo">("Ativo");

    // Funções de manipulação de usuários
    function handleAdicionarUsuario(e: React.FormEvent) {
        e.preventDefault();
        if (!novoNome.trim() || !novoEmail.trim()) return;

        const novo: Usuario = {
            id: Date.now().toString(),
            nome: novoNome.trim(),
            email: novoEmail.trim(),
            status: novoStatus,
            dataCadastro: new Date().toLocaleDateString("pt-BR")
        };

        setUsuarios([novo, ...usuarios]);
        setNovoNome("");
        setNovoEmail("");
        setMostrarModalNovo(false);
    }

    function alternarStatus(id: string) {
        setUsuarios(usuarios.map(u => {
            if (u.id === id) {
                return { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" };
            }
            return u;
        }));
    }

    function removerUsuario(id: string) {
        setUsuarios(usuarios.filter(u => u.id !== id));
    }

    // Filtragem dos usuários
    const usuariosFiltrados = usuarios.filter(u => {
        const matchesBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) ||
                             u.email.toLowerCase().includes(busca.toLowerCase());
        const matchesStatus = filtroStatus === "Todos" || u.status === filtroStatus;
        return matchesBusca && matchesStatus;
    });

    const totalAtivos = usuarios.filter(u => u.status === "Ativo").length;

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-muted/40 p-6 md:flex">
                <div className="flex items-center gap-2 mb-6">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                        M
                    </span>
                    <div>
                        <h2 className="text-lg font-heading font-bold leading-none text-primary">MotivaFit</h2>
                        <span className="text-xs text-muted-foreground">Painel Admin</span>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    <Button
                        variant={secaoAtiva === "dashboard" ? "secondary" : "ghost"}
                        className="justify-start gap-2.5"
                        onClick={() => setSecaoAtiva("dashboard")}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button
                        variant={secaoAtiva === "usuarios" ? "secondary" : "ghost"}
                        className="justify-start gap-2.5"
                        onClick={() => setSecaoAtiva("usuarios")}
                    >
                        <Users className="h-4 w-4" />
                        Usuários
                        <Badge variant="outline" className="ml-auto text-xs py-0 px-1.5">
                            {usuarios.length}
                        </Badge>
                    </Button>
                    <Button
                        variant={secaoAtiva === "treinos" ? "secondary" : "ghost"}
                        className="justify-start gap-2.5"
                        onClick={() => setSecaoAtiva("treinos")}
                    >
                        <Dumbbell className="h-4 w-4" />
                        Treinos
                    </Button>
                    <Button
                        variant={secaoAtiva === "relatorios" ? "secondary" : "ghost"}
                        className="justify-start gap-2.5"
                        onClick={() => setSecaoAtiva("relatorios")}
                    >
                        <FileText className="h-4 w-4" />
                        Relatórios
                    </Button>
                    <Button
                        variant={secaoAtiva === "config" ? "secondary" : "ghost"}
                        className="justify-start gap-2.5"
                        onClick={() => setSecaoAtiva("config")}
                    >
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>

                    <Separator className="my-3" />

                    <Button variant="outline" className="justify-start gap-2 text-xs" asChild>
                        <Link to="/principal">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Ver App do Aluno
                        </Link>
                    </Button>
                </nav>

                <Separator className="my-4" />
                <Button
                    variant="ghost"
                    className="justify-start gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => navigate("/")}
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Button>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-x-hidden">
                {/* Top Bar */}
                <header className="flex items-center justify-between border-b px-6 py-4 bg-card/60 backdrop-blur">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight capitalize">
                            {secaoAtiva === "dashboard" && "Dashboard Geral"}
                            {secaoAtiva === "usuarios" && "Gestão de Usuários"}
                            {secaoAtiva === "treinos" && "Gerenciamento de Treinos"}
                            {secaoAtiva === "relatorios" && "Relatórios de Desempenho"}
                            {secaoAtiva === "config" && "Configurações da Plataforma"}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            MotivaFit Academia & Treinos
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-medium">Administrador</span>
                            <span className="block text-xs text-muted-foreground">admin@motivafit.com</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarImage src="" alt="Avatar do administrador" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">ADM</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 space-y-6 p-6">
                    {/* Metrics Cards (always visible on Dashboard, or summarized) */}
                    {(secaoAtiva === "dashboard" || secaoAtiva === "usuarios") && (
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardDescription>Total de Usuários</CardDescription>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{usuarios.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Cadastrados no sistema</p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardDescription>Usuários Ativos</CardDescription>
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {totalAtivos}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {((totalAtivos / (usuarios.length || 1)) * 100).toFixed(0)}% de engajamento
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardDescription>Inativos / Pendentes</CardDescription>
                                    <XCircle className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                        {usuarios.length - totalAtivos}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Necessitam contato</p>
                                </CardContent>
                            </Card>

                            <Card className="hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardDescription>Treinos Realizados</CardDescription>
                                    <Activity className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">8.721</div>
                                    <p className="text-xs text-emerald-600 font-medium mt-1">+12% este mês</p>
                                </CardContent>
                            </Card>
                        </section>
                    )}

                    {/* Section: USUARIOS / TABELA PRINCIPAL */}
                    {(secaoAtiva === "dashboard" || secaoAtiva === "usuarios") && (
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-xl">Usuários da Plataforma</CardTitle>
                                        <CardDescription>
                                            Gerencie os alunos cadastrados no MotivaFit
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => setMostrarModalNovo(true)}
                                            className="gap-1.5"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Adicionar Usuário
                                        </Button>
                                    </div>
                                </div>

                                {/* Barra de busca e filtros */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar por nome ou e-mail..."
                                            value={busca}
                                            onChange={(e) => setBusca(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                    <div className="flex gap-1.5">
                                        <Button
                                            variant={filtroStatus === "Todos" ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => setFiltroStatus("Todos")}
                                        >
                                            Todos
                                        </Button>
                                        <Button
                                            variant={filtroStatus === "Ativo" ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => setFiltroStatus("Ativo")}
                                        >
                                            Ativos
                                        </Button>
                                        <Button
                                            variant={filtroStatus === "Inativo" ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => setFiltroStatus("Inativo")}
                                        >
                                            Inativos
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {usuariosFiltrados.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        Nenhum usuário encontrado com os filtros aplicados.
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
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
                                                {usuariosFiltrados.map((u) => (
                                                    <TableRow key={u.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2.5">
                                                                <Avatar className="h-7 w-7 text-xs">
                                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                                        {u.nome.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                {u.nome}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={u.status === "Ativo" ? "default" : "secondary"}
                                                                className={u.status === "Ativo" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                                            >
                                                                {u.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{u.dataCadastro}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-1.5">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => alternarStatus(u.id)}
                                                                    title="Alternar Ativo/Inativo"
                                                                >
                                                                    {u.status === "Ativo" ? "Desativar" : "Ativar"}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-destructive hover:bg-destructive/10"
                                                                    onClick={() => removerUsuario(u.id)}
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
                    )}

                    {/* Section: TREINOS */}
                    {secaoAtiva === "treinos" && (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Hipertrofia - Iniciante</CardTitle>
                                    <CardDescription>Plano de adaptação muscular (4 semanas)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p>🏋️ <strong>Alunos inscritos:</strong> 42</p>
                                    <p>⏱️ <strong>Frequência:</strong> 3x por semana</p>
                                    <Button className="w-full mt-3" variant="outline">Gerenciar Ficha</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Emagrecimento & HIIT</CardTitle>
                                    <CardDescription>Treinos com foco cardiovascular e déficit</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p>🏋️ <strong>Alunos inscritos:</strong> 78</p>
                                    <p>⏱️ <strong>Frequência:</strong> 5x por semana</p>
                                    <Button className="w-full mt-3" variant="outline">Gerenciar Ficha</Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Força Avançada (Power)</CardTitle>
                                    <CardDescription>Cargas progressivas e compostos pesados</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <p>🏋️ <strong>Alunos inscritos:</strong> 29</p>
                                    <p>⏱️ <strong>Frequência:</strong> 4x por semana</p>
                                    <Button className="w-full mt-3" variant="outline">Gerenciar Ficha</Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Section: RELATORIOS */}
                    {secaoAtiva === "relatorios" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Relatórios e Métricas de Uso</CardTitle>
                                <CardDescription>Consolidado mensal de atividade dos alunos</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="p-4 border rounded-lg bg-card">
                                        <span className="text-sm text-muted-foreground">Taxa de Conclusão de Treinos</span>
                                        <div className="text-2xl font-bold mt-1 text-primary">87.4%</div>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-card">
                                        <span className="text-sm text-muted-foreground">Média de Treinos / Aluno</span>
                                        <div className="text-2xl font-bold mt-1">3.6 / sem</div>
                                    </div>
                                    <div className="p-4 border rounded-lg bg-card">
                                        <span className="text-sm text-muted-foreground">Retenção de 30 dias</span>
                                        <div className="text-2xl font-bold mt-1 text-emerald-500">92%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Section: CONFIGURAÇÕES */}
                    {secaoAtiva === "config" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Configurações da Plataforma</CardTitle>
                                <CardDescription>Preferências do sistema MotivaFit</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="nome-academia">Nome da Academia / Organização</Label>
                                    <Input id="nome-academia" defaultValue="MotivaFit Academia" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contato-suporte">E-mail de Suporte</Label>
                                    <Input id="contato-suporte" defaultValue="suporte@motivafit.com" />
                                </div>
                                <Button className="mt-2">Salvar Alterações</Button>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>

            {/* Modal de Adicionar Usuário */}
            {mostrarModalNovo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Adicionar Novo Usuário</CardTitle>
                            <CardDescription>Cadastre um aluno ou instrutor no MotivaFit</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAdicionarUsuario}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="novo-nome">Nome Completo</Label>
                                    <Input
                                        id="novo-nome"
                                        placeholder="Ex: Carlos Eduardo"
                                        value={novoNome}
                                        onChange={(e) => setNovoNome(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="novo-email">E-mail</Label>
                                    <Input
                                        id="novo-email"
                                        type="email"
                                        placeholder="carlos@email.com"
                                        value={novoEmail}
                                        onChange={(e) => setNovoEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="novo-status">Status Inicial</Label>
                                    <select
                                        id="novo-status"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={novoStatus}
                                        onChange={(e) => setNovoStatus(e.target.value as "Ativo" | "Inativo")}
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
                                <Button type="submit">
                                    Cadastrar
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

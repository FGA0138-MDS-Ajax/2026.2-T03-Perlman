import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, Link } from "react-router-dom";
import {
    Home,
    Dumbbell,
    LineChart,
    Settings,
    LogOut,
    Shield,
    Plus,
    Search,
    Trash2,
    Edit3,
    Check,
    Sparkles,
    ArrowLeft,
    ArrowRight,
    Layers,
    Play,
    Copy,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    X,
    Trophy
} from "lucide-react";

// Tipos alinhados ao diagrama de classes (TREINO, EXERCICIO, CATALOGO_EXERCICIO)
export type ModalidadeTreino = "musculação" | "aeróbico";

export interface CatalogoExercicioItem {
    id: string;
    nome: string;
    grupoMuscular: string;
    metaPadrao: string;
    metaRecordePadrao: string;
    origem: "MOTIVAFIT" | "USUARIO";
}

export interface ExercicioTreino {
    id: string; // id único da instância no treino
    catalogoExercicioId: string;
    nome: string;
    grupoMuscular: string;
    meta: string; // meta (texto)
    metaRecorde: string; // metaRecorde (texto)
}

export interface TemplateTreino {
    id: string;
    nome: string;
    tipo: ModalidadeTreino;
    exercicios: ExercicioTreino[];
}

export interface Treino {
    id: string;
    nome: string;
    tipo: ModalidadeTreino;
    dataCriacao: string;
    exercicios: ExercicioTreino[];
}

// Catálogo Base do MotivaFit (CATALOGO_EXERCICIO)
const CATALOGO_MOTIVAFIT: CatalogoExercicioItem[] = [
    { id: "mf-1", nome: "Supino Reto com Barra", grupoMuscular: "Peitoral", metaPadrao: "4 séries de 10-12 reps", metaRecordePadrao: "30 kg cada lado", origem: "MOTIVAFIT" },
    { id: "mf-2", nome: "Supino Inclinado com Halteres", grupoMuscular: "Peitoral", metaPadrao: "3 séries de 12 reps", metaRecordePadrao: "18 kg haltere", origem: "MOTIVAFIT" },
    { id: "mf-3", nome: "Crucifixo com Halteres", grupoMuscular: "Peitoral", metaPadrao: "3 séries de 12-15 reps", metaRecordePadrao: "14 kg haltere", origem: "MOTIVAFIT" },
    { id: "mf-4", nome: "Puxada Alta Aberta", grupoMuscular: "Costas", metaPadrao: "4 séries de 10-12 reps", metaRecordePadrao: "50 kg placa", origem: "MOTIVAFIT" },
    { id: "mf-5", nome: "Remada Curvada com Barra", grupoMuscular: "Costas", metaPadrao: "4 séries de 10 reps", metaRecordePadrao: "25 kg cada lado", origem: "MOTIVAFIT" },
    { id: "mf-6", nome: "Remada Baixa no Triângulo", grupoMuscular: "Costas", metaPadrao: "3 séries de 12 reps", metaRecordePadrao: "45 kg placa", origem: "MOTIVAFIT" },
    { id: "mf-7", nome: "Agachamento Livre com Barra", grupoMuscular: "Pernas", metaPadrao: "4 séries de 8-10 reps", metaRecordePadrao: "35 kg cada lado", origem: "MOTIVAFIT" },
    { id: "mf-8", nome: "Leg Press 45°", grupoMuscular: "Pernas", metaPadrao: "4 séries de 12 reps", metaRecordePadrao: "160 kg total", origem: "MOTIVAFIT" },
    { id: "mf-9", nome: "Cadeira Extensora", grupoMuscular: "Pernas", metaPadrao: "3 séries de 15 reps", metaRecordePadrao: "40 kg placa", origem: "MOTIVAFIT" },
    { id: "mf-10", nome: "Mesa Flexora", grupoMuscular: "Pernas", metaPadrao: "3 séries de 12 reps", metaRecordePadrao: "35 kg placa", origem: "MOTIVAFIT" },
    { id: "mf-11", nome: "Desenvolvimento Militar", grupoMuscular: "Ombros", metaPadrao: "4 séries de 10 reps", metaRecordePadrao: "15 kg cada lado", origem: "MOTIVAFIT" },
    { id: "mf-12", nome: "Elevação Lateral com Halteres", grupoMuscular: "Ombros", metaPadrao: "4 séries de 12-15 reps", metaRecordePadrao: "10 kg haltere", origem: "MOTIVAFIT" },
    { id: "mf-13", nome: "Rosca Direta com Barra W", grupoMuscular: "Bíceps", metaPadrao: "3 séries de 10-12 reps", metaRecordePadrao: "12 kg cada lado", origem: "MOTIVAFIT" },
    { id: "mf-14", nome: "Rosca Martelo com Halteres", grupoMuscular: "Bíceps", metaPadrao: "3 séries de 12 reps", metaRecordePadrao: "14 kg haltere", origem: "MOTIVAFIT" },
    { id: "mf-15", nome: "Tríceps Corda na Polia", grupoMuscular: "Tríceps", metaPadrao: "3 séries de 15 reps", metaRecordePadrao: "25 kg placa", origem: "MOTIVAFIT" },
    { id: "mf-16", nome: "Tríceps Francês Unilateral", grupoMuscular: "Tríceps", metaPadrao: "3 séries de 12 reps", metaRecordePadrao: "12 kg haltere", origem: "MOTIVAFIT" },
    { id: "mf-17", nome: "Abdominal Supra no Solo", grupoMuscular: "Abdômen", metaPadrao: "4 séries de 20 reps", metaRecordePadrao: "Peso corporal", origem: "MOTIVAFIT" },
    { id: "mf-18", nome: "Prancha Isométrica", grupoMuscular: "Abdômen", metaPadrao: "3 séries de 60s", metaRecordePadrao: "60 segundos", origem: "MOTIVAFIT" },
    { id: "mf-19", nome: "Corrida Esteira HIIT", grupoMuscular: "Cardio", metaPadrao: "20 minutos contínuos", metaRecordePadrao: "Velocidade 11 km/h", origem: "MOTIVAFIT" },
    { id: "mf-20", nome: "Bicicleta Ergométrica", grupoMuscular: "Cardio", metaPadrao: "30 minutos moderados", metaRecordePadrao: "Nível 7", origem: "MOTIVAFIT" },
];

// Templates Prontos do MotivaFit
const TEMPLATES_MOTIVAFIT: TemplateTreino[] = [
    {
        id: "tpl-1",
        nome: "Treino A - Peito, Ombros e Tríceps",
        tipo: "musculação",
        exercicios: [
            { id: "t1-1", catalogoExercicioId: "mf-1", nome: "Supino Reto com Barra", grupoMuscular: "Peitoral", meta: "4 séries de 10-12 reps", metaRecorde: "30 kg cada lado" },
            { id: "t1-2", catalogoExercicioId: "mf-2", nome: "Supino Inclinado com Halteres", grupoMuscular: "Peitoral", meta: "3 séries de 12 reps", metaRecorde: "18 kg haltere" },
            { id: "t1-3", catalogoExercicioId: "mf-11", nome: "Desenvolvimento Militar", grupoMuscular: "Ombros", meta: "4 séries de 10 reps", metaRecorde: "15 kg cada lado" },
            { id: "t1-4", catalogoExercicioId: "mf-12", nome: "Elevação Lateral com Halteres", grupoMuscular: "Ombros", meta: "4 séries de 12-15 reps", metaRecorde: "10 kg haltere" },
            { id: "t1-5", catalogoExercicioId: "mf-15", nome: "Tríceps Corda na Polia", grupoMuscular: "Tríceps", meta: "3 séries de 15 reps", metaRecorde: "25 kg placa" },
        ]
    },
    {
        id: "tpl-2",
        nome: "Treino B - Costas e Bíceps",
        tipo: "musculação",
        exercicios: [
            { id: "t2-1", catalogoExercicioId: "mf-4", nome: "Puxada Alta Aberta", grupoMuscular: "Costas", meta: "4 séries de 10-12 reps", metaRecorde: "50 kg placa" },
            { id: "t2-2", catalogoExercicioId: "mf-5", nome: "Remada Curvada com Barra", grupoMuscular: "Costas", meta: "4 séries de 10 reps", metaRecorde: "25 kg cada lado" },
            { id: "t2-3", catalogoExercicioId: "mf-6", nome: "Remada Baixa no Triângulo", grupoMuscular: "Costas", meta: "3 séries de 12 reps", metaRecorde: "45 kg placa" },
            { id: "t2-4", catalogoExercicioId: "mf-13", nome: "Rosca Direta com Barra W", grupoMuscular: "Bíceps", meta: "3 séries de 10-12 reps", metaRecorde: "12 kg cada lado" },
            { id: "t2-5", catalogoExercicioId: "mf-14", nome: "Rosca Martelo com Halteres", grupoMuscular: "Bíceps", meta: "3 séries de 12 reps", metaRecorde: "14 kg haltere" },
        ]
    },
    {
        id: "tpl-3",
        nome: "Treino C - Membros Inferiores",
        tipo: "musculação",
        exercicios: [
            { id: "t3-1", catalogoExercicioId: "mf-7", nome: "Agachamento Livre com Barra", grupoMuscular: "Pernas", meta: "4 séries de 8-10 reps", metaRecorde: "35 kg cada lado" },
            { id: "t3-2", catalogoExercicioId: "mf-8", nome: "Leg Press 45°", grupoMuscular: "Pernas", meta: "4 séries de 12 reps", metaRecorde: "160 kg total" },
            { id: "t3-3", catalogoExercicioId: "mf-9", nome: "Cadeira Extensora", grupoMuscular: "Pernas", meta: "3 séries de 15 reps", metaRecorde: "40 kg placa" },
            { id: "t3-4", catalogoExercicioId: "mf-10", nome: "Mesa Flexora", grupoMuscular: "Pernas", meta: "3 séries de 12 reps", metaRecorde: "35 kg placa" },
        ]
    },
    {
        id: "tpl-4",
        nome: "Treino Funcional & Cardio",
        tipo: "aeróbico",
        exercicios: [
            { id: "t4-1", catalogoExercicioId: "mf-19", nome: "Corrida Esteira HIIT", grupoMuscular: "Cardio", meta: "25 minutos alternando ritmo", metaRecorde: "Velocidade 11 km/h" },
            { id: "t4-2", catalogoExercicioId: "mf-17", nome: "Abdominal Supra no Solo", grupoMuscular: "Abdômen", meta: "4 séries de 20 reps", metaRecorde: "Peso corporal" },
            { id: "t4-3", catalogoExercicioId: "mf-18", nome: "Prancha Isométrica", grupoMuscular: "Abdômen", meta: "3 séries de 60s", metaRecorde: "60 segundos" },
        ]
    }
];

// Exercícios personalizados do usuário
const MEUS_EXERCICIOS_INICIAL: CatalogoExercicioItem[] = [
    { id: "usr-1", nome: "Afundo Búlgaro com Halteres", grupoMuscular: "Pernas", metaPadrao: "3 séries de 12 reps cada perna", metaRecordePadrao: "14 kg halteres", origem: "USUARIO" },
    { id: "usr-2", nome: "Elevação Pélvica com Barra", grupoMuscular: "Pernas", metaPadrao: "4 séries de 10-12 reps", metaRecordePadrao: "50 kg barra", origem: "USUARIO" },
    { id: "usr-3", nome: "Crucifixo Invertido no Peck Deck", grupoMuscular: "Costas", metaPadrao: "4 séries de 15 reps", metaRecordePadrao: "30 kg placa", origem: "USUARIO" },
    { id: "usr-4", nome: "Remada Cavalinho com Anilha", grupoMuscular: "Costas", metaPadrao: "4 séries de 10 reps", metaRecordePadrao: "40 kg anilhas", origem: "USUARIO" },
];

// Treinos cadastrados iniciais
const TREINOS_INICIAIS: Treino[] = [
    {
        id: "tr-1",
        nome: "Treino A - Peito, Ombros e Tríceps",
        tipo: "musculação",
        dataCriacao: "20/10/2026",
        exercicios: [
            { id: "e-1", catalogoExercicioId: "mf-1", nome: "Supino Reto com Barra", grupoMuscular: "Peitoral", meta: "4 séries de 10-12 reps", metaRecorde: "30 kg cada lado" },
            { id: "e-2", catalogoExercicioId: "mf-2", nome: "Supino Inclinado com Halteres", grupoMuscular: "Peitoral", meta: "3 séries de 12 reps", metaRecorde: "18 kg haltere" },
            { id: "e-3", catalogoExercicioId: "mf-11", nome: "Desenvolvimento Militar", grupoMuscular: "Ombros", meta: "4 séries de 10 reps", metaRecorde: "15 kg cada lado" },
            { id: "e-4", catalogoExercicioId: "mf-15", nome: "Tríceps Corda na Polia", grupoMuscular: "Tríceps", meta: "3 séries de 15 reps", metaRecorde: "25 kg placa" },
        ]
    },
    {
        id: "tr-2",
        nome: "Treino B - Dorsal e Bíceps",
        tipo: "musculação",
        dataCriacao: "22/10/2026",
        exercicios: [
            { id: "e-5", catalogoExercicioId: "mf-4", nome: "Puxada Alta Aberta", grupoMuscular: "Costas", meta: "4 séries de 10-12 reps", metaRecorde: "50 kg placa" },
            { id: "e-6", catalogoExercicioId: "mf-5", nome: "Remada Curvada com Barra", grupoMuscular: "Costas", meta: "4 séries de 10 reps", metaRecorde: "25 kg cada lado" },
            { id: "e-7", catalogoExercicioId: "mf-13", nome: "Rosca Direta com Barra W", grupoMuscular: "Bíceps", meta: "3 séries de 10-12 reps", metaRecorde: "12 kg cada lado" },
        ]
    }
];

export default function PaginaTreinos() {
    const navigate = useNavigate();

    // Estados dos treinos e dos exercícios do usuário
    const [treinos, setTreinos] = useState<Treino[]>(() => {
        const salvos = localStorage.getItem("@motivafit:treinos");
        return salvos ? JSON.parse(salvos) : TREINOS_INICIAIS;
    });

    const [meusExercicios, setMeusExercicios] = useState<CatalogoExercicioItem[]>(() => {
        const salvos = localStorage.getItem("@motivafit:meus-exercicios");
        return salvos ? JSON.parse(salvos) : MEUS_EXERCICIOS_INICIAL;
    });

    useEffect(() => {
        localStorage.setItem("@motivafit:treinos", JSON.stringify(treinos));
    }, [treinos]);

    useEffect(() => {
        localStorage.setItem("@motivafit:meus-exercicios", JSON.stringify(meusExercicios));
    }, [meusExercicios]);

    // Controle de modo e passos (Passo 1: Dados do Treino, Passo 2: Exercícios do Treino)
    const [modo, setModo] = useState<"LISTAGEM" | "CRIAR" | "EDITAR">("LISTAGEM");
    const [passoAtual, setPassoAtual] = useState<1 | 2>(1);
    const [treinoAbertoId, setTreinoAbertoId] = useState<string | null>(null);

    // Controle da seleção de exercícios no Passo 2
    const [abaExercicios, setAbaExercicios] = useState<"MOTIVAFIT" | "MEUS_EXERCICIOS">("MOTIVAFIT");
    const [pesquisaExercicio, setPesquisaExercicio] = useState("");
    const [filtroGrupo, setFiltroGrupo] = useState<string>("TODOS");

    // Estado do Treino em Criação / Edição (Nome do Treino, Modalidade e Exercícios)
    const [treinoForm, setTreinoForm] = useState<{
        id: string;
        nome: string;
        tipo: ModalidadeTreino;
        exercicios: ExercicioTreino[];
    }>({
        id: "",
        nome: "",
        tipo: "musculação",
        exercicios: []
    });

    // Modal de Criar Novo Exercício (para a lista do usuário)
    const [modalNovoExercicioAberto, setModalNovoExercicioAberto] = useState(false);
    const [novoExercicioForm, setNovoExercicioForm] = useState<{
        nome: string;
        grupoMuscular: string;
        metaPadrao: string;
        metaRecordePadrao: string;
        adicionarAoTreinoAtual: boolean;
    }>({
        nome: "",
        grupoMuscular: "Peitoral",
        metaPadrao: "4 séries de 10-12 reps",
        metaRecordePadrao: "20 kg",
        adicionarAoTreinoAtual: true
    });

    // Toast de notificação
    const [notificacao, setNotificacao] = useState<string | null>(null);

    function mostrarNotificacao(texto: string) {
        setNotificacao(texto);
        setTimeout(() => setNotificacao(null), 3000);
    }

    // Abertura da tela de criação (inicia no Passo 1: Dados do Treino)
    function handleAbrirCriarTreino() {
        setTreinoForm({
            id: `tr-${Date.now()}`,
            nome: "",
            tipo: "musculação",
            exercicios: []
        });
        setPassoAtual(1);
        setAbaExercicios("MOTIVAFIT");
        setPesquisaExercicio("");
        setFiltroGrupo("TODOS");
        setModo("CRIAR");
    }

    // Abertura da tela de edição (inicia no Passo 1: Dados do Treino)
    function handleAbrirEditarTreino(treino: Treino) {
        setTreinoForm({
            id: treino.id,
            nome: treino.nome,
            tipo: treino.tipo,
            exercicios: [...treino.exercicios]
        });
        setPassoAtual(1);
        setAbaExercicios("MOTIVAFIT");
        setPesquisaExercicio("");
        setFiltroGrupo("TODOS");
        setModo("EDITAR");
    }

    // Avançar do Passo 1 para o Passo 2
    function handleAvancarParaPasso2(e: React.FormEvent) {
        e.preventDefault();
        if (!treinoForm.nome.trim()) {
            alert("Por favor, preencha o Nome do treino.");
            return;
        }
        setPassoAtual(2);
    }

    // Exclusão de treino
    function handleExcluirTreino(id: string) {
        if (confirm("Deseja realmente excluir este treino?")) {
            setTreinos(treinos.filter(t => t.id !== id));
            mostrarNotificacao("Treino excluído!");
        }
    }

    // Aplicar template ao treino em edição
    function handleAplicarTemplate(template: TemplateTreino) {
        const novos = template.exercicios.map(ex => ({
            ...ex,
            id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
        }));

        setTreinoForm(prev => ({
            ...prev,
            tipo: template.tipo,
            exercicios: [...prev.exercicios, ...novos]
        }));

        mostrarNotificacao(`Template "${template.nome}" adicionado!`);
    }

    // Adicionar exercício individual ao treino
    function handleAdicionarExercicioAoTreino(item: CatalogoExercicioItem) {
        const novoItem: ExercicioTreino = {
            id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            catalogoExercicioId: item.id,
            nome: item.nome,
            grupoMuscular: item.grupoMuscular,
            meta: item.metaPadrao,
            metaRecorde: item.metaRecordePadrao
        };

        setTreinoForm(prev => ({
            ...prev,
            exercicios: [...prev.exercicios, novoItem]
        }));

        mostrarNotificacao(`"${item.nome}" adicionado.`);
    }

    // Atualizar meta ou metaRecorde de um exercício no treino
    function handleAtualizarExercicioNoTreino(idConfig: string, campo: "meta" | "metaRecorde", valor: string) {
        setTreinoForm(prev => ({
            ...prev,
            exercicios: prev.exercicios.map(ex => {
                if (ex.id === idConfig) {
                    return { ...ex, [campo]: valor };
                }
                return ex;
            })
        }));
    }

    // Remover exercício do treino
    function handleRemoverExercicioDoTreino(idConfig: string) {
        setTreinoForm(prev => ({
            ...prev,
            exercicios: prev.exercicios.filter(ex => ex.id !== idConfig)
        }));
    }

    // Salvar formulário final de treino (Passo 2)
    function handleSalvarTreinoFinal() {
        if (!treinoForm.nome.trim()) {
            alert("Por favor, preencha o Nome do treino.");
            setPassoAtual(1);
            return;
        }

        if (treinoForm.exercicios.length === 0) {
            alert("Adicione pelo menos um exercício aos Exercícios do Treino.");
            return;
        }

        if (modo === "CRIAR") {
            const novoTreino: Treino = {
                id: treinoForm.id || `tr-${Date.now()}`,
                nome: treinoForm.nome.trim(),
                tipo: treinoForm.tipo,
                dataCriacao: new Date().toLocaleDateString("pt-BR"),
                exercicios: treinoForm.exercicios
            };
            setTreinos([novoTreino, ...treinos]);
            mostrarNotificacao(`Treino "${novoTreino.nome}" criado com sucesso!`);
        } else {
            setTreinos(treinos.map(t => {
                if (t.id === treinoForm.id) {
                    return {
                        ...t,
                        nome: treinoForm.nome.trim(),
                        tipo: treinoForm.tipo,
                        exercicios: treinoForm.exercicios
                    };
                }
                return t;
            }));
            mostrarNotificacao(`Treino "${treinoForm.nome}" atualizado!`);
        }

        setModo("LISTAGEM");
    }

    // Cadastrar novo exercício na lista do usuário
    function handleSalvarNovoExercicio(e: React.FormEvent) {
        e.preventDefault();
        if (!novoExercicioForm.nome.trim()) {
            alert("Informe o nome do exercício.");
            return;
        }

        const novo: CatalogoExercicioItem = {
            id: `usr-${Date.now()}`,
            nome: novoExercicioForm.nome.trim(),
            grupoMuscular: novoExercicioForm.grupoMuscular,
            metaPadrao: novoExercicioForm.metaPadrao.trim() || "4 séries de 10-12 reps",
            metaRecordePadrao: novoExercicioForm.metaRecordePadrao.trim() || "20 kg",
            origem: "USUARIO"
        };

        setMeusExercicios([novo, ...meusExercicios]);

        if (novoExercicioForm.adicionarAoTreinoAtual) {
            handleAdicionarExercicioAoTreino(novo);
        }

        mostrarNotificacao(`Exercício "${novo.nome}" cadastrado!`);
        setModalNovoExercicioAberto(false);
        setNovoExercicioForm({
            nome: "",
            grupoMuscular: "Peitoral",
            metaPadrao: "4 séries de 10-12 reps",
            metaRecordePadrao: "20 kg",
            adicionarAoTreinoAtual: true
        });
    }

    // Filtros
    const gruposMusculares = ["TODOS", "Peitoral", "Costas", "Pernas", "Ombros", "Bíceps", "Tríceps", "Abdômen", "Cardio"];

    const catalogoMotivaFitFiltrado = CATALOGO_MOTIVAFIT.filter(item => {
        const matchTexto = item.nome.toLowerCase().includes(pesquisaExercicio.toLowerCase()) ||
                           item.grupoMuscular.toLowerCase().includes(pesquisaExercicio.toLowerCase());
        const matchGrupo = filtroGrupo === "TODOS" || item.grupoMuscular.toLowerCase() === filtroGrupo.toLowerCase();
        return matchTexto && matchGrupo;
    });

    const templatesMotivaFitFiltrados = TEMPLATES_MOTIVAFIT.filter(tpl => {
        return tpl.nome.toLowerCase().includes(pesquisaExercicio.toLowerCase()) ||
               tpl.tipo.toLowerCase().includes(pesquisaExercicio.toLowerCase());
    });

    const meusExerciciosFiltrados = meusExercicios.filter(item => {
        const matchTexto = item.nome.toLowerCase().includes(pesquisaExercicio.toLowerCase()) ||
                           item.grupoMuscular.toLowerCase().includes(pesquisaExercicio.toLowerCase());
        const matchGrupo = filtroGrupo === "TODOS" || item.grupoMuscular.toLowerCase() === filtroGrupo.toLowerCase();
        return matchTexto && matchGrupo;
    });

    return (
        <div className="flex min-h-screen bg-background">
            {/* Toast de feedback */}
            {notificacao && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-background shadow-xl animate-in slide-in-from-bottom-5 duration-300">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{notificacao}</span>
                </div>
            )}

            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-muted/30 p-6 md:flex">
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-heading font-bold text-foreground">MotivaFit</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1.5">
                    <Button variant="ghost" className="justify-start gap-2.5" asChild>
                        <Link to="/principal">
                            <Home className="h-4 w-4" />
                            Início
                        </Link>
                    </Button>
                    <Button variant="secondary" className="justify-start gap-2.5">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        Meus Treinos
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5">
                        <LineChart className="h-4 w-4" />
                        Progresso
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2.5">
                        <Settings className="h-4 w-4" />
                        Configurações
                    </Button>

                    <Separator className="my-3" />

                    <Button variant="outline" size="sm" className="justify-start gap-2 text-xs" asChild>
                        <Link to="/admin">
                            <Shield className="h-3.5 w-3.5" />
                            Painel Administrativo
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

            {/* Conteúdo Central */}
            <div className="flex flex-1 flex-col overflow-x-hidden">
                {/* Header */}
                <header className="flex items-center justify-between border-b px-6 py-4 bg-background/60 backdrop-blur">
                    <div className="flex items-center gap-3">
                        {modo !== "LISTAGEM" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (passoAtual === 2) {
                                        setPassoAtual(1);
                                    } else {
                                        setModo("LISTAGEM");
                                    }
                                }}
                                className="gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {passoAtual === 2 ? "Voltar ao Passo 1" : "Voltar aos Treinos"}
                            </Button>
                        )}
                        <div>
                            <h1 className="text-xl font-heading font-bold">
                                {modo === "LISTAGEM" && "Meus Treinos"}
                                {modo !== "LISTAGEM" && (modo === "CRIAR" ? "Novo Treino" : `Editar: ${treinoForm.nome}`)}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {modo === "LISTAGEM" && "Gerenciamento e montagem de treinos"}
                                {modo !== "LISTAGEM" && (passoAtual === 1 ? "Passo 1: Dados do Treino" : "Passo 2: Exercícios do Treino")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <span className="block text-sm font-medium">Carlos Eduardo</span>
                            <span className="block text-xs text-muted-foreground">Plano Pro</span>
                        </div>
                        <Avatar className="h-9 w-9 border border-primary/20">
                            <AvatarImage src="" alt="Avatar" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">CE</AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                <main className="flex-1 p-6">
                    {/* ========================================================= */}
                    {/* 1. LISTAGEM DE TREINOS                                    */}
                    {/* ========================================================= */}
                    {modo === "LISTAGEM" && (
                        <div className="space-y-6 max-w-5xl mx-auto">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-heading font-bold">Treinos do Usuário</h2>
                                    <Badge variant="secondary" className="font-normal text-xs">
                                        {treinos.length}
                                    </Badge>
                                </div>

                                <Button
                                    onClick={handleAbrirCriarTreino}
                                    className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                >
                                    <Plus className="h-4 w-4" />
                                    Criar Treino
                                </Button>
                            </div>

                            {treinos.length === 0 ? (
                                <Card className="p-12 text-center border-dashed">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-base font-bold">Nenhum treino criado</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                                        Crie seu primeiro treino selecionando templates ou seus exercícios.
                                    </p>
                                    <Button onClick={handleAbrirCriarTreino} size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Criar Treino
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {treinos.map((treino) => {
                                        const aberto = treinoAbertoId === treino.id;
                                        return (
                                            <Card key={treino.id} className="border-border/80 flex flex-col hover:shadow-xs transition-shadow">
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <Badge variant="outline" className="text-[11px] font-semibold uppercase text-primary border-primary/30 bg-primary/5">
                                                                {treino.tipo}
                                                            </Badge>
                                                            <CardTitle className="text-lg font-heading font-bold mt-1.5">
                                                                {treino.nome}
                                                            </CardTitle>
                                                        </div>

                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                title="Editar treino"
                                                                onClick={() => handleAbrirEditarTreino(treino)}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                title="Excluir treino"
                                                                onClick={() => handleExcluirTreino(treino.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="flex-1 pb-4">
                                                    <div className="rounded-lg bg-muted/40 p-3 space-y-2 border border-border/50">
                                                        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                                                            <span>Exercícios ({treino.exercicios.length})</span>
                                                            <button
                                                                onClick={() => setTreinoAbertoId(aberto ? null : treino.id)}
                                                                className="text-primary hover:underline flex items-center gap-1"
                                                            >
                                                                {aberto ? "Recolher" : "Ver todos"}
                                                                {aberto ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                            </button>
                                                        </div>

                                                        <div className="space-y-1.5 pt-1">
                                                            {(aberto ? treino.exercicios : treino.exercicios.slice(0, 3)).map((ex, idx) => (
                                                                <div key={ex.id || idx} className="text-xs py-1 border-b border-border/40 last:border-0 flex items-start justify-between gap-2">
                                                                    <div className="flex items-center gap-2 truncate">
                                                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-background text-[10px] font-bold text-muted-foreground">
                                                                            {idx + 1}
                                                                        </span>
                                                                        <span className="font-medium text-foreground truncate">{ex.nome}</span>
                                                                    </div>
                                                                    <div className="text-right text-[11px] text-muted-foreground shrink-0">
                                                                        <span>{ex.meta}</span>
                                                                        {ex.metaRecorde && (
                                                                            <span className="block font-medium text-foreground/80">{ex.metaRecorde}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}

                                                            {!aberto && treino.exercicios.length > 3 && (
                                                                <p className="text-[11px] text-muted-foreground text-center pt-1 italic">
                                                                    + {treino.exercicios.length - 3} outros exercícios
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>

                                                <div className="px-6 pb-4 pt-0 mt-auto flex items-center justify-end">
                                                    <Button
                                                        size="sm"
                                                        className="gap-1.5 bg-primary hover:bg-primary/90 font-medium"
                                                        onClick={() => mostrarNotificacao(`Treino "${treino.nome}" iniciado!`)}
                                                    >
                                                        <Play className="h-3.5 w-3.5 fill-current" />
                                                        Iniciar Treino
                                                    </Button>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* FLUXO EM TELAS SEPARADAS (PASSO 1 E PASSO 2)              */}
                    {/* ========================================================= */}
                    {modo !== "LISTAGEM" && (
                        <div className="max-w-5xl mx-auto space-y-6">
                            {/* Indicador de Passos */}
                            <div className="flex items-center justify-center">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPassoAtual(1)}
                                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                            passoAtual === 1
                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                : "bg-muted text-foreground hover:bg-muted/80"
                                        }`}
                                    >
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                                            passoAtual === 1 ? "bg-primary-foreground text-primary" : "bg-foreground/10 text-foreground"
                                        }`}>
                                            1
                                        </span>
                                        Dados do Treino
                                    </button>

                                    <div className="w-8 h-0.5 bg-border" />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (treinoForm.nome.trim()) {
                                                setPassoAtual(2);
                                            } else {
                                                alert("Preencha o Nome do treino antes de avançar.");
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                            passoAtual === 2
                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                                            passoAtual === 2 ? "bg-primary-foreground text-primary" : "bg-foreground/10 text-muted-foreground"
                                        }`}>
                                            2
                                        </span>
                                        Exercícios do Treino
                                    </button>
                                </div>
                            </div>

                            {/* -------------------------------------------------- */}
                            {/* PASSO 1: DADOS DO TREINO                           */}
                            {/* -------------------------------------------------- */}
                            {passoAtual === 1 && (
                                <Card className="max-w-lg mx-auto border-border/80 shadow-sm animate-in fade-in-50">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-xl font-heading font-bold text-foreground">
                                            Dados do Treino
                                        </CardTitle>
                                        <CardDescription>
                                            Informe os dados gerais de identificação e modalidade do seu treino.
                                        </CardDescription>
                                    </CardHeader>

                                    <form onSubmit={handleAvancarParaPasso2}>
                                        <CardContent className="space-y-5">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="nomeTreino" className="text-xs font-semibold">
                                                    Nome do Treino *
                                                </Label>
                                                <Input
                                                    id="nomeTreino"
                                                    placeholder="Ex: Treino A - Superior"
                                                    value={treinoForm.nome}
                                                    onChange={(e) => setTreinoForm({ ...treinoForm, nome: e.target.value })}
                                                    required
                                                    autoFocus
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold">Modalidade</Label>
                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <Button
                                                        type="button"
                                                        variant={treinoForm.tipo === "musculação" ? "default" : "outline"}
                                                        className="text-xs h-10 font-medium"
                                                        onClick={() => setTreinoForm({ ...treinoForm, tipo: "musculação" })}
                                                    >
                                                        Musculação
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={treinoForm.tipo === "aeróbico" ? "default" : "outline"}
                                                        className="text-xs h-10 font-medium"
                                                        onClick={() => setTreinoForm({ ...treinoForm, tipo: "aeróbico" })}
                                                    >
                                                        Aeróbico
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setModo("LISTAGEM")}
                                            >
                                                Cancelar
                                            </Button>

                                            <Button
                                                type="submit"
                                                size="sm"
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5"
                                            >
                                                Próximo: Exercícios do Treino
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </form>
                                </Card>
                            )}

                            {/* -------------------------------------------------- */}
                            {/* PASSO 2: EXERCÍCIOS DO TREINO                     */}
                            {/* -------------------------------------------------- */}
                            {passoAtual === 2 && (
                                <div className="space-y-6 animate-in fade-in-50">
                                    {/* Sessão principal: Exercícios do Treino */}
                                    <div className="rounded-xl border bg-card p-5 shadow-xs space-y-6">
                                        {/* Cabeçalho da Sessão */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                                            <div>
                                                <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                                                    <Dumbbell className="h-5 w-5 text-primary" />
                                                    Exercícios do Treino
                                                </h2>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Treino: <strong className="text-foreground">{treinoForm.nome}</strong> • Modalidade: <span className="capitalize">{treinoForm.tipo}</span>
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPassoAtual(1)}
                                                className="text-xs gap-1.5 text-muted-foreground hover:text-foreground self-start sm:self-auto"
                                            >
                                                <Edit3 className="h-3.5 w-3.5" />
                                                Alterar Dados do Treino
                                            </Button>
                                        </div>

                                        {/* CAIXA MOTIVAFIT / MEUS EXERCÍCIOS DENTRO DA SESSÃO EXERCÍCIOS DO TREINO */}
                                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                                            {/* Abas Superiores da Caixa: MotivaFit e Meus Exercícios */}
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                                <div className="grid grid-cols-2 p-1 bg-background rounded-lg border shadow-xs max-w-md w-full sm:w-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAbaExercicios("MOTIVAFIT")}
                                                        className={`flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-bold rounded-md transition-all ${
                                                            abaExercicios === "MOTIVAFIT"
                                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                    >
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        MotivaFit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => setAbaExercicios("MEUS_EXERCICIOS")}
                                                        className={`flex items-center justify-center gap-1.5 py-1.5 px-4 text-xs font-bold rounded-md transition-all ${
                                                            abaExercicios === "MEUS_EXERCICIOS"
                                                                ? "bg-primary text-primary-foreground shadow-xs"
                                                                : "text-muted-foreground hover:text-foreground"
                                                        }`}
                                                    >
                                                        <Dumbbell className="h-3.5 w-3.5" />
                                                        Meus Exercícios
                                                        <Badge variant="outline" className={`ml-1 text-[9px] py-0 px-1 border-current ${
                                                            abaExercicios === "MEUS_EXERCICIOS" ? "bg-primary-foreground/20 text-primary-foreground" : "text-muted-foreground"
                                                        }`}>
                                                            {meusExercicios.length}
                                                        </Badge>
                                                    </button>
                                                </div>

                                                {/* Botão de Adicionar Novo Exercício por aqui (quando na aba Meus Exercícios) */}
                                                {abaExercicios === "MEUS_EXERCICIOS" && (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={() => setModalNovoExercicioAberto(true)}
                                                        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-8"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                        Novo Exercício
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Barra de Pesquisa Compartilhada em ambas as abas */}
                                            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Buscar por nome do exercício ou grupo muscular..."
                                                        className="pl-8 text-xs h-8 bg-background"
                                                        value={pesquisaExercicio}
                                                        onChange={(e) => setPesquisaExercicio(e.target.value)}
                                                    />
                                                    {pesquisaExercicio && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setPesquisaExercicio("")}
                                                            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <X className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Filtro Rápido por Grupo Muscular */}
                                                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
                                                    {gruposMusculares.map(grupo => (
                                                        <button
                                                            key={grupo}
                                                            type="button"
                                                            onClick={() => setFiltroGrupo(grupo)}
                                                            className={`shrink-0 px-2 py-1 rounded transition-colors ${
                                                                filtroGrupo === grupo
                                                                    ? "bg-primary text-primary-foreground font-semibold"
                                                                    : "bg-background text-muted-foreground hover:bg-muted border"
                                                            }`}
                                                        >
                                                            {grupo}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* CONTEÚDO DA ABA MOTIVAFIT */}
                                            {abaExercicios === "MOTIVAFIT" && (
                                                <div className="space-y-3 pt-1">
                                                    {/* Templates Prontos */}
                                                    {templatesMotivaFitFiltrados.length > 0 && filtroGrupo === "TODOS" && (
                                                        <div className="space-y-2">
                                                            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                                                <Layers className="h-3.5 w-3.5 text-primary" />
                                                                Templates Prontos da Plataforma
                                                            </div>

                                                            <div className="grid gap-2 sm:grid-cols-2">
                                                                {templatesMotivaFitFiltrados.map((tpl) => (
                                                                    <div
                                                                        key={tpl.id}
                                                                        className="rounded-lg border bg-background p-2.5 flex items-center justify-between gap-2 shadow-xs hover:border-primary/40 transition-colors"
                                                                    >
                                                                        <div className="truncate pr-1">
                                                                            <h4 className="text-xs font-bold text-foreground truncate">{tpl.nome}</h4>
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                {tpl.exercicios.length} exercícios incluídos
                                                                            </span>
                                                                        </div>

                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 text-[11px] gap-1 shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary font-medium"
                                                                            onClick={() => handleAplicarTemplate(tpl)}
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                            Usar Template
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <Separator className="my-2" />
                                                        </div>
                                                    )}

                                                    {/* Catálogo Individual de Exercícios */}
                                                    <div className="space-y-1.5">
                                                        <div className="text-xs font-bold text-foreground">
                                                            Exercícios do Catálogo ({catalogoMotivaFitFiltrado.length})
                                                        </div>

                                                        {catalogoMotivaFitFiltrado.length === 0 ? (
                                                            <p className="text-xs text-muted-foreground text-center py-4 bg-background rounded-lg border">
                                                                Nenhum exercício encontrado na busca.
                                                            </p>
                                                        ) : (
                                                            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-56 overflow-y-auto pr-1">
                                                                {catalogoMotivaFitFiltrado.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex items-center justify-between rounded-lg border p-2 text-xs bg-background hover:border-primary/40 transition-colors"
                                                                    >
                                                                        <div className="truncate pr-2">
                                                                            <div className="font-semibold text-foreground truncate">{item.nome}</div>
                                                                            <div className="text-[10px] text-muted-foreground">
                                                                                {item.grupoMuscular} • {item.metaPadrao}
                                                                            </div>
                                                                        </div>

                                                                        <Button
                                                                            type="button"
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-6 text-xs gap-1 shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                                                            onClick={() => handleAdicionarExercicioAoTreino(item)}
                                                                        >
                                                                            <Plus className="h-3 w-3" />
                                                                            Adicionar
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* CONTEÚDO DA ABA MEUS EXERCÍCIOS */}
                                            {abaExercicios === "MEUS_EXERCICIOS" && (
                                                <div className="space-y-2 pt-1">
                                                    {meusExerciciosFiltrados.length === 0 ? (
                                                        <div className="rounded-lg border border-dashed p-6 text-center bg-background">
                                                            <p className="text-xs font-semibold text-foreground">
                                                                Nenhum exercício cadastrado por você ainda
                                                            </p>
                                                            <p className="text-[11px] text-muted-foreground mt-0.5 mb-3">
                                                                Clique em "Novo Exercício" para criar e salvar seus exercícios personalizados.
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                onClick={() => setModalNovoExercicioAberto(true)}
                                                                className="gap-1.5 text-xs"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                                Cadastrar Meu Primeiro Exercício
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 max-h-56 overflow-y-auto pr-1">
                                                            {meusExerciciosFiltrados.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    className="flex items-center justify-between rounded-lg border p-2 text-xs bg-background hover:border-primary/40 transition-colors"
                                                                >
                                                                    <div className="truncate pr-2">
                                                                        <div className="font-semibold text-foreground truncate flex items-center gap-1">
                                                                            {item.nome}
                                                                            <Badge variant="secondary" className="text-[8px] py-0 px-1 font-normal">
                                                                                Meu
                                                                            </Badge>
                                                                        </div>
                                                                        <div className="text-[10px] text-muted-foreground">
                                                                            {item.grupoMuscular} • {item.metaPadrao}
                                                                        </div>
                                                                    </div>

                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 text-xs gap-1 shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                                                        onClick={() => handleAdicionarExercicioAoTreino(item)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                        Adicionar
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* LISTA DE EXERCÍCIOS ADICIONADOS AO TREINO */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-2">
                                                    Lista de Exercícios do Treino
                                                    <Badge variant="secondary" className="font-normal text-xs">
                                                        {treinoForm.exercicios.length} {treinoForm.exercicios.length === 1 ? "exercício" : "exercícios"}
                                                    </Badge>
                                                </h3>

                                                {treinoForm.exercicios.length > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-destructive hover:bg-destructive/10 h-7"
                                                        onClick={() => setTreinoForm({ ...treinoForm, exercicios: [] })}
                                                    >
                                                        Remover todos
                                                    </Button>
                                                )}
                                            </div>

                                            {treinoForm.exercicios.length === 0 ? (
                                                <div className="rounded-xl border border-dashed p-8 text-center bg-muted/20">
                                                    <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                                                    <p className="text-xs font-semibold text-foreground">
                                                        Nenhum exercício selecionado para o treino
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto mt-0.5">
                                                        Utilize a caixa acima (MotivaFit ou Meus Exercícios) para adicionar exercícios ao seu treino.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {treinoForm.exercicios.map((ex, index) => (
                                                        <div
                                                            key={ex.id}
                                                            className="flex flex-col gap-2 rounded-lg border bg-card p-3 shadow-xs hover:border-primary/40 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                                                                        {index + 1}
                                                                    </span>
                                                                    <span className="font-semibold text-xs text-foreground truncate max-w-[200px]">
                                                                        {ex.nome}
                                                                    </span>
                                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-muted-foreground/30">
                                                                        {ex.grupoMuscular}
                                                                    </Badge>
                                                                </div>

                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => handleRemoverExercicioDoTreino(ex.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px] text-muted-foreground font-semibold">Meta (texto)</Label>
                                                                    <Input
                                                                        className="h-7 text-xs font-medium"
                                                                        placeholder="Ex: 4 séries de 10-12 reps"
                                                                        value={ex.meta}
                                                                        onChange={(e) => handleAtualizarExercicioNoTreino(ex.id, "meta", e.target.value)}
                                                                    />
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                                                        <Trophy className="h-3 w-3 text-amber-500" />
                                                                        Meta Recorde (texto)
                                                                    </Label>
                                                                    <Input
                                                                        className="h-7 text-xs font-medium"
                                                                        placeholder="Ex: 30 kg cada lado"
                                                                        value={ex.metaRecorde}
                                                                        onChange={(e) => handleAtualizarExercicioNoTreino(ex.id, "metaRecorde", e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Barra de Ações Final */}
                                        <div className="border-t pt-4 flex items-center justify-between">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPassoAtual(1)}
                                                className="gap-1.5"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Voltar aos Dados do Treino
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 px-5"
                                                onClick={handleSalvarTreinoFinal}
                                            >
                                                <Check className="h-4 w-4" />
                                                Salvar Treino
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* ========================================================= */}
            {/* MODAL CADASTRAR NOVO EXERCÍCIO (na lista do usuário)      */}
            {/* ========================================================= */}
            {modalNovoExercicioAberto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
                    <div className="w-full max-w-sm rounded-xl bg-card p-5 shadow-2xl border border-border space-y-3.5">
                        <div className="flex items-center justify-between border-b pb-2.5">
                            <h3 className="text-sm font-heading font-bold text-foreground flex items-center gap-1.5">
                                <Plus className="h-4 w-4 text-primary" />
                                Novo Exercício
                            </h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => setModalNovoExercicioAberto(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <form onSubmit={handleSalvarNovoExercicio} className="space-y-3">
                            <div className="space-y-1">
                                <Label htmlFor="modalNomeExercicio" className="text-xs font-semibold">
                                    Nome *
                                </Label>
                                <Input
                                    id="modalNomeExercicio"
                                    placeholder="Ex: Afundo Búlgaro"
                                    className="h-8 text-xs"
                                    value={novoExercicioForm.nome}
                                    onChange={(e) => setNovoExercicioForm({ ...novoExercicioForm, nome: e.target.value })}
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="modalGrupoMuscular" className="text-xs font-semibold">
                                    Grupo Muscular
                                </Label>
                                <select
                                    id="modalGrupoMuscular"
                                    className="w-full h-8 rounded-md border border-input bg-transparent px-2.5 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={novoExercicioForm.grupoMuscular}
                                    onChange={(e) => setNovoExercicioForm({ ...novoExercicioForm, grupoMuscular: e.target.value })}
                                >
                                    <option value="Peitoral">Peitoral</option>
                                    <option value="Costas">Costas</option>
                                    <option value="Pernas">Pernas</option>
                                    <option value="Ombros">Ombros</option>
                                    <option value="Bíceps">Bíceps</option>
                                    <option value="Tríceps">Tríceps</option>
                                    <option value="Abdômen">Abdômen</option>
                                    <option value="Cardio">Cardio</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="modalMeta" className="text-xs font-semibold">
                                    Meta (texto)
                                </Label>
                                <Input
                                    id="modalMeta"
                                    placeholder="Ex: 4 séries de 10-12 reps"
                                    className="h-8 text-xs"
                                    value={novoExercicioForm.metaPadrao}
                                    onChange={(e) => setNovoExercicioForm({ ...novoExercicioForm, metaPadrao: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="modalMetaRecorde" className="text-xs font-semibold flex items-center gap-1">
                                    <Trophy className="h-3 w-3 text-amber-500" />
                                    Meta Recorde (texto)
                                </Label>
                                <Input
                                    id="modalMetaRecorde"
                                    placeholder="Ex: 20 kg cada halter"
                                    className="h-8 text-xs"
                                    value={novoExercicioForm.metaRecordePadrao}
                                    onChange={(e) => setNovoExercicioForm({ ...novoExercicioForm, metaRecordePadrao: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="addAoTreinoCheck"
                                    checked={novoExercicioForm.adicionarAoTreinoAtual}
                                    onChange={(e) => setNovoExercicioForm({ ...novoExercicioForm, adicionarAoTreinoAtual: e.target.checked })}
                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="addAoTreinoCheck" className="text-xs cursor-pointer">
                                    Adicionar ao treino atual
                                </Label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={() => setModalNovoExercicioAberto(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                                >
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

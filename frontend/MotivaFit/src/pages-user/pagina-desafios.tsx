import { useCallback, useEffect, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
    Trophy, Plus, Trash2, Send, ImagePlus, Users, Globe, Lock,
    Calendar, MessageSquare, X, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import Aside from "@/components/aside";
import Header from "@/components/header";

// ---------------------------------------------------------------------------
//  Tipos
// ---------------------------------------------------------------------------
interface Mensagem {
    id: string;
    autorEmail: string;
    texto: string;
    imagemUrl: string | null;
    criadoEm: string;
}

interface Desafio {
    id: string;
    nome: string;
    descricao: string;
    criadorEmail: string;
    visibilidade: "PUBLICO" | "PRIVADO";
    criadoEm: string;
    participantes: string[];
    mensagens: Mensagem[];
}

// ---------------------------------------------------------------------------
//  Persistência local (substituto temporário do backend)
// ---------------------------------------------------------------------------
const CHAVE_STORAGE = "@motivafit:desafios";

function carregarDesafios(): Desafio[] {
    try {
        const json = localStorage.getItem(CHAVE_STORAGE);
        return json ? (JSON.parse(json) as Desafio[]) : [];
    } catch {
        return [];
    }
}

function salvarDesafios(lista: Desafio[]): void {
    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
    } catch {
        // Silencioso se o armazenamento estiver bloqueado
    }
}

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------
function gerarId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function iniciais(email: string): string {
    return email.trim().slice(0, 2).toUpperCase() || "??";
}

function formatarData(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

function lerImagem(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Falha ao ler arquivo."));
        reader.readAsDataURL(file);
    });
}

// ---------------------------------------------------------------------------
//  Componente principal
// ---------------------------------------------------------------------------
export default function PaginaDesafios() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const email = user?.email ?? "";

    const [desafios, setDesafios] = useState<Desafio[]>(carregarDesafios);
    const [aba, setAba] = useState<"meus" | "publicos">("meus");
    const [formAberto, setFormAberto] = useState(false);
    const [desafioAberto, setDesafioAberto] = useState<string | null>(null);
    const [menuAberto, setMenuAberto] = useState(false);

    // Persistir sempre que mudar
    useEffect(() => {
        salvarDesafios(desafios);
    }, [desafios]);

    // Escutar alterações do localStorage de outra aba
    useEffect(() => {
        function listener(event: StorageEvent) {
            if (event.key === CHAVE_STORAGE) setDesafios(carregarDesafios());
        }
        window.addEventListener("storage", listener);
        return () => window.removeEventListener("storage", listener);
    }, []);

    // Filtros
    const meusDesafios = desafios.filter(
        (d) => d.criadorEmail === email || d.participantes.includes(email),
    );
    const desafiosPublicos = desafios.filter(
        (d) => d.visibilidade === "PUBLICO" && d.criadorEmail !== email && !d.participantes.includes(email),
    );

    // Handlers
    function criarDesafio(nome: string, descricao: string, visibilidade: "PUBLICO" | "PRIVADO") {
        const novo: Desafio = {
            id: gerarId(),
            nome,
            descricao,
            criadorEmail: email,
            visibilidade,
            criadoEm: new Date().toISOString(),
            participantes: [email],
            mensagens: [],
        };
        setDesafios((atual) => [novo, ...atual]);
        setFormAberto(false);
    }

    function participar(desafioId: string) {
        setDesafios((atual) =>
            atual.map((d) =>
                d.id === desafioId && !d.participantes.includes(email)
                    ? { ...d, participantes: [...d.participantes, email] }
                    : d,
            ),
        );
    }

    function removerDesafio(desafioId: string) {
        setDesafios((atual) => atual.filter((d) => d.id !== desafioId));
        if (desafioAberto === desafioId) setDesafioAberto(null);
    }

    const enviarMensagem = useCallback(
        (desafioId: string, texto: string, imagemUrl: string | null) => {
            const msg: Mensagem = {
                id: gerarId(),
                autorEmail: email,
                texto,
                imagemUrl,
                criadoEm: new Date().toISOString(),
            };
            setDesafios((atual) =>
                atual.map((d) =>
                    d.id === desafioId ? { ...d, mensagens: [...d.mensagens, msg] } : d,
                ),
            );
        },
        [email],
    );

    const desafioSelecionado = desafios.find((d) => d.id === desafioAberto) ?? null;

    return (
        <div className="flex min-h-screen bg-background">
            <Aside
                menuAberto={menuAberto}
                setMenuAberto={setMenuAberto}
                isAdmin={isAdmin}
                logout={logout}
                saindo={saindo}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    email={email}
                    menuAberto={menuAberto}
                    setMenuAberto={setMenuAberto}
                    title="Desafios"
                    subtitle="Crie desafios, participe e interaja com outros atletas."
                />

                {/* Abas */}
                <div className="flex flex-wrap items-center justify-center bg-background/60 px-4 py-3 sm:px-6 gap-0">
                    <Button
                        type="button"
                        className="rounded-r-none cursor-pointer"
                        variant={aba === "meus" ? "default" : "outline"}
                        onClick={() => { setAba("meus"); setDesafioAberto(null); }}
                    >
                        <Trophy className="mr-2 h-4 w-4" />
                        Meus Desafios
                    </Button>
                    <Button
                        type="button"
                        className="rounded-l-none cursor-pointer"
                        variant={aba === "publicos" ? "default" : "outline"}
                        onClick={() => { setAba("publicos"); setDesafioAberto(null); }}
                    >
                        <Globe className="mr-2 h-4 w-4" />
                        Desafios Públicos
                    </Button>
                </div>

                <main className="min-w-0 flex-1 p-4 sm:p-6">
                    {/* Chat do desafio selecionado */}
                    {desafioSelecionado ? (
                        <ChatDesafio
                            desafio={desafioSelecionado}
                            emailUsuario={email}
                            onVoltar={() => setDesafioAberto(null)}
                            onEnviar={enviarMensagem}
                            onRemover={removerDesafio}
                        />
                    ) : (
                        <div className="mx-auto max-w-5xl space-y-6">
                            {/* Cabeçalho + botão criar */}
                            {aba === "meus" && (
                                <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                                    <h2 className="font-heading text-lg font-bold">Meus Desafios</h2>
                                    <Button onClick={() => setFormAberto(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Criar desafio
                                    </Button>
                                </div>
                            )}
                            {aba === "publicos" && (
                                <h2 className="font-heading text-lg font-bold">Desafios Públicos</h2>
                            )}

                            {/* Formulário de criação */}
                            {formAberto && aba === "meus" && (
                                <FormularioDesafio
                                    onCriar={criarDesafio}
                                    onCancelar={() => setFormAberto(false)}
                                />
                            )}

                            {/* Listas */}
                            {aba === "meus" && (
                                <ListaDesafios
                                    desafios={meusDesafios}
                                    emailUsuario={email}
                                    vazio="Você ainda não participa de nenhum desafio."
                                    onAbrir={setDesafioAberto}
                                    onRemover={removerDesafio}
                                />
                            )}
                            {aba === "publicos" && (
                                <ListaDesafiosPublicos
                                    desafios={desafiosPublicos}
                                    onParticipar={participar}
                                    onAbrir={(id) => { participar(id); setAba("meus"); setDesafioAberto(id); }}
                                />
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
//  Formulário de criação
// ---------------------------------------------------------------------------
function FormularioDesafio({
    onCriar,
    onCancelar,
}: {
    onCriar: (nome: string, descricao: string, visibilidade: "PUBLICO" | "PRIVADO") => void;
    onCancelar: () => void;
}) {
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [visibilidade, setVisibilidade] = useState<"PUBLICO" | "PRIVADO">("PUBLICO");
    const [erro, setErro] = useState("");

    function submit(e: FormEvent) {
        e.preventDefault();
        const nomeLimpo = nome.trim();
        if (!nomeLimpo) {
            setErro("O nome do desafio é obrigatório.");
            return;
        }
        if (nomeLimpo.length > 100) {
            setErro("O nome pode ter no máximo 100 caracteres.");
            return;
        }
        onCriar(nomeLimpo, descricao.trim(), visibilidade);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Novo Desafio</CardTitle>
                <CardDescription>
                    Crie um desafio estilo Gym Rats e convide outros atletas a participar!
                </CardDescription>
            </CardHeader>
            <form onSubmit={submit}>
                <CardContent className="space-y-4">
                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}

                    <div className="space-y-1.5">
                        <Label htmlFor="nomeDesafio">Nome do desafio</Label>
                        <Input
                            id="nomeDesafio"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: 30 dias de academia 💪"
                            maxLength={100}
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="descDesafio">Descrição (opcional)</Label>
                        <textarea
                            id="descDesafio"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Descreva as regras do desafio…"
                            maxLength={500}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label>Visibilidade</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={visibilidade === "PUBLICO" ? "default" : "outline"}
                                onClick={() => setVisibilidade("PUBLICO")}
                                className="gap-2"
                            >
                                <Globe className="h-4 w-4" />
                                Público
                            </Button>
                            <Button
                                type="button"
                                variant={visibilidade === "PRIVADO" ? "default" : "outline"}
                                onClick={() => setVisibilidade("PRIVADO")}
                                className="gap-2"
                            >
                                <Lock className="h-4 w-4" />
                                Privado
                            </Button>
                        </div>
                    </div>
                </CardContent>
                <div className="flex items-center justify-between border-t p-4">
                    <Button type="button" variant="outline" onClick={onCancelar}>
                        Cancelar
                    </Button>
                    <Button type="submit">Criar desafio</Button>
                </div>
            </form>
        </Card>
    );
}

// ---------------------------------------------------------------------------
//  Lista de desafios do usuário
// ---------------------------------------------------------------------------
function ListaDesafios({
    desafios,
    emailUsuario,
    vazio,
    onAbrir,
    onRemover,
}: {
    desafios: Desafio[];
    emailUsuario: string;
    vazio: string;
    onAbrir: (id: string) => void;
    onRemover: (id: string) => void;
}) {
    if (desafios.length === 0) {
        return <p className="text-sm text-muted-foreground py-4">{vazio}</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {desafios.map((desafio) => (
                <Card key={desafio.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={desafio.visibilidade === "PUBLICO" ? "default" : "secondary"}>
                                {desafio.visibilidade === "PUBLICO" ? (
                                    <><Globe className="mr-1 h-3 w-3" />Público</>
                                ) : (
                                    <><Lock className="mr-1 h-3 w-3" />Privado</>
                                )}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {desafio.participantes.length}
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {desafio.mensagens.length}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg">{desafio.nome}</CardTitle>
                        {desafio.descricao && (
                            <CardDescription className="line-clamp-2">{desafio.descricao}</CardDescription>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            Criado em {formatarData(desafio.criadoEm)}
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => onAbrir(desafio.id)} className="gap-1.5">
                            <MessageSquare className="h-4 w-4" />
                            Abrir chat
                        </Button>
                        {desafio.criadorEmail === emailUsuario && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                    if (window.confirm(`Tem certeza que deseja excluir o desafio "${desafio.nome}"?`)) {
                                        onRemover(desafio.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
//  Lista de desafios públicos (explorar)
// ---------------------------------------------------------------------------
function ListaDesafiosPublicos({
    desafios,
    onParticipar,
    onAbrir,
}: {
    desafios: Desafio[];
    onParticipar: (id: string) => void;
    onAbrir: (id: string) => void;
}) {
    if (desafios.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-4">
                Nenhum desafio público disponível no momento. Crie o seu!
            </p>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {desafios.map((desafio) => (
                <Card key={desafio.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default">
                                <Globe className="mr-1 h-3 w-3" />Público
                            </Badge>
                            <Badge variant="outline" className="gap-1">
                                <Users className="h-3 w-3" />
                                {desafio.participantes.length} participante{desafio.participantes.length !== 1 ? "s" : ""}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg">{desafio.nome}</CardTitle>
                        {desafio.descricao && (
                            <CardDescription className="line-clamp-2">{desafio.descricao}</CardDescription>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Criado por {desafio.criadorEmail} · {formatarData(desafio.criadoEm)}
                        </p>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => onParticipar(desafio.id)} className="gap-1.5">
                            <Users className="h-4 w-4" />
                            Participar
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAbrir(desafio.id)}
                            className="gap-1.5"
                        >
                            <MessageSquare className="h-4 w-4" />
                            Entrar e abrir chat
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ---------------------------------------------------------------------------
//  Chat do desafio
// ---------------------------------------------------------------------------
function ChatDesafio({
    desafio,
    emailUsuario,
    onVoltar,
    onEnviar,
    onRemover,
}: {
    desafio: Desafio;
    emailUsuario: string;
    onVoltar: () => void;
    onEnviar: (desafioId: string, texto: string, imagemUrl: string | null) => void;
    onRemover: (desafioId: string) => void;
}) {
    const [texto, setTexto] = useState("");
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [enviandoImagem, setEnviandoImagem] = useState(false);
    const fimRef = useRef<HTMLDivElement>(null);
    const inputImagemRef = useRef<HTMLInputElement>(null);

    const eDono = desafio.criadorEmail === emailUsuario;

    // Scroll para o fim quando chegar nova mensagem
    useEffect(() => {
        fimRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [desafio.mensagens.length]);

    async function handleImagem(e: ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            alert("Selecione um arquivo de imagem.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("A imagem deve ter no máximo 5 MB.");
            return;
        }
        setEnviandoImagem(true);
        try {
            const dataUrl = await lerImagem(file);
            setImagemPreview(dataUrl);
        } catch {
            alert("Falha ao carregar a imagem.");
        } finally {
            setEnviandoImagem(false);
            if (inputImagemRef.current) inputImagemRef.current.value = "";
        }
    }

    function enviar(e: FormEvent) {
        e.preventDefault();
        const textoLimpo = texto.trim();
        if (!textoLimpo && !imagemPreview) return;
        onEnviar(desafio.id, textoLimpo, imagemPreview);
        setTexto("");
        setImagemPreview(null);
    }

    return (
        <div className="mx-auto flex max-w-4xl flex-col" style={{ height: "calc(100dvh - 160px)" }}>
            {/* Header do chat */}
            <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-card px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Button type="button" variant="ghost" size="icon" onClick={onVoltar} className="shrink-0">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="min-w-0">
                        <h2 className="truncate font-heading text-base font-bold">{desafio.nome}</h2>
                        <p className="truncate text-xs text-muted-foreground">
                            {desafio.participantes.length} participante{desafio.participantes.length !== 1 ? "s" : ""} · {desafio.mensagens.length} mensage{desafio.mensagens.length !== 1 ? "ns" : "m"}
                        </p>
                    </div>
                </div>
                {eDono && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => {
                            if (window.confirm(`Excluir o desafio "${desafio.nome}" permanentemente?`)) {
                                onRemover(desafio.id);
                            }
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir desafio</span>
                    </Button>
                )}
            </div>

            {/* Descrição, se houver */}
            {desafio.descricao && (
                <div className="border-x bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
                    <strong className="text-foreground">Regras:</strong> {desafio.descricao}
                </div>
            )}

            {/* Área de mensagens */}
            <div className="flex-1 overflow-y-auto border-x bg-background p-4 space-y-4">
                {desafio.mensagens.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhuma mensagem ainda. Seja o primeiro a postar! 🏋️
                    </p>
                )}
                {desafio.mensagens.map((msg) => {
                    const eAutor = msg.autorEmail === emailUsuario;
                    return (
                        <div
                            key={msg.id}
                            className={`flex gap-2.5 ${eAutor ? "flex-row-reverse" : ""}`}
                        >
                            <Avatar className="h-8 w-8 shrink-0 border border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                    {iniciais(msg.autorEmail)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`max-w-[75%] space-y-1 ${eAutor ? "items-end" : ""}`}>
                                <p className={`text-xs text-muted-foreground ${eAutor ? "text-right" : ""}`}>
                                    {eAutor ? "Você" : msg.autorEmail} · {formatarData(msg.criadoEm)}
                                </p>
                                <div
                                    className={`rounded-xl px-3.5 py-2.5 text-sm ${
                                        eAutor
                                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                                            : "bg-muted rounded-tl-sm"
                                    }`}
                                >
                                    {msg.imagemUrl && (
                                        <img
                                            src={msg.imagemUrl}
                                            alt="Imagem enviada"
                                            className="mb-2 max-h-60 rounded-lg object-cover"
                                        />
                                    )}
                                    {msg.texto && <p className="whitespace-pre-wrap break-words">{msg.texto}</p>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={fimRef} />
            </div>

            {/* Preview da imagem selecionada */}
            {imagemPreview && (
                <div className="relative border-x bg-muted/30 px-4 py-2">
                    <img
                        src={imagemPreview}
                        alt="Preview"
                        className="h-20 rounded-lg object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => setImagemPreview(null)}
                        className="absolute top-1 right-5 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* Input de mensagem */}
            <form
                onSubmit={enviar}
                className="flex items-center gap-2 rounded-b-xl border bg-card px-3 py-2.5"
            >
                <input
                    ref={inputImagemRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { void handleImagem(e); }}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    onClick={() => inputImagemRef.current?.click()}
                    disabled={enviandoImagem}
                    aria-label="Anexar imagem"
                >
                    <ImagePlus className="h-5 w-5" />
                </Button>
                <Input
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Digite sua mensagem…"
                    className="flex-1"
                />
                <Button
                    type="submit"
                    size="icon"
                    className="shrink-0 h-9 w-9"
                    disabled={!texto.trim() && !imagemPreview}
                    aria-label="Enviar mensagem"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}


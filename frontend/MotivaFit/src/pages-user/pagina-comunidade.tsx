import { useRef, useState, type FormEvent } from "react";
import { Heart, ImagePlus, Plus } from "lucide-react";
import Aside from "@/components/aside";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

type Serie = { repeticoes: number; cargaKg: number };
type TreinoRealizado = {
    id: string;
    nome: string;
    data: string;
    exercicios: { nome: string; series: Serie[] }[];
};

type Publicacao = {
    id: string;
    autor: string;
    amigoId?: string;
    data: string;
    texto: string;
    foto?: { src: string; alt: string };
    treino?: TreinoRealizado;
    curtidas: number;
    curtida?: boolean;
    comentarios: number;
    recorde?: boolean;
};

const pessoas = [
    { id: "luis", nome: "Luis F.", descricao: "Musculação" },
    { id: "mateus", nome: "Mateus D.", descricao: "Treino funcional" },
    { id: "bruno", nome: "Bruno C.", descricao: "Powerlifting, 4x por semana" },
    { id: "lucas", nome: "Lucas V.", descricao: "Calistenia e mobilidade" },
    { id: "rafael", nome: "Rafael L.", descricao: "Push/Pull/Legs desde 2023" },
    { id: "ana", nome: "Ana P.", descricao: "Força e agachamento profundo" },
    { id: "camila", nome: "Camila R.", descricao: "Treino de glúteos e posterior" },
];

function exercicio(nome: string, series: number, repeticoes: number, cargaKg: number) {
    return { nome, series: Array.from({ length: series }, () => ({ repeticoes, cargaKg })) };
}

const fichasExemplo = [
    { nome: "Push A - Peito e Tríceps", exercicios: [exercicio("Supino reto", 4, 8, 75), exercicio("Supino inclinado", 3, 10, 60), exercicio("Tríceps testa", 3, 12, 30)] },
    { nome: "Pull B - Costas e Bíceps", exercicios: [exercicio("Puxada frontal", 4, 10, 50), exercicio("Remada baixa", 3, 12, 45), exercicio("Rosca direta", 3, 10, 20)] },
    { nome: "Legs C - Pernas", exercicios: [exercicio("Agachamento livre", 4, 8, 70), exercicio("Leg press", 3, 10, 120), exercicio("Mesa flexora", 3, 12, 35)] },
];

function dataExemplo(dias: number, horas = 0) {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    data.setHours(data.getHours() - horas);
    return data.toISOString();
}

const historico: TreinoRealizado[] = Array.from({ length: 24 }, (_, indice) => ({
    ...fichasExemplo[indice % fichasExemplo.length],
    id: `sessao-${indice}`,
    data: dataExemplo(indice + 1),
}));

const feedInicial: Publicacao[] = [
    {
        id: "recorde", autor: "Bruno C.", amigoId: "bruno", data: dataExemplo(0, 2),
        texto: "Terra 140 kg x 3. Novo recorde pessoal depois de 6 semanas travado.",
        foto: { src: "/assets/comunidade/levantamento-terra.webp", alt: "Atleta fazendo levantamento terra com barra" },
        recorde: true, curtidas: 12, comentarios: 1,
    },
    {
        id: "push", autor: "Luis F.", amigoId: "luis", data: dataExemplo(0, 5),
        texto: "Meu Push A da semana. Compartilhando como foi a sessão!",
        treino: { ...fichasExemplo[0], id: "sessao-luis", data: dataExemplo(0, 6) },
        curtidas: 8, curtida: true, comentarios: 0,
    },
    {
        id: "desafio", autor: "Mateus D.", amigoId: "mateus", data: dataExemplo(1),
        texto: "Entrei no desafio da prancha. Alguém me alcança?",
        curtidas: 5, comentarios: 2,
    },
];

const dataCurta = new Intl.DateTimeFormat("pt-BR");
const dataPublicacao = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const botaoContorno = "rounded-none border-current";
const botaoDestaque = "rounded-none bg-[#ed390b] text-white hover:bg-[#c82f09]";
const rotulo = "font-mono text-xs uppercase tracking-widest text-muted-foreground";
const tamanhoPagina = 10;
const treinosRecentes = historico.slice(0, 3);

function Inicial({ nome }: { nome: string }) {
    return (
        <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs text-background">
            {nome.charAt(0).toUpperCase()}
        </span>
    );
}

function AnexoTreino({ treino }: { treino: TreinoRealizado }) {
    const data = dataCurta.format(new Date(treino.data));
    return (
        <section className="border border-foreground">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-foreground bg-muted px-4 py-3">
                <h3 className="font-heading text-base font-bold italic">{treino.nome}</h3>
                <time className={rotulo} dateTime={treino.data}>{data}</time>
            </div>
            <ul className="divide-y px-4 text-sm">
                {treino.exercicios.map((item) => <li className="py-2" key={item.nome}>{item.nome}</li>)}
            </ul>
            <div className="border-t p-3">
                <Dialog>
                    <DialogTrigger render={<Button className={`w-full ${botaoDestaque}`} />}>Ver treino</DialogTrigger>
                    <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-none sm:max-w-lg">
                        <DialogHeader className="pr-10">
                            <DialogTitle className="text-lg">{treino.nome}</DialogTitle>
                            <DialogDescription>Realizado em {data}</DialogDescription>
                        </DialogHeader>
                        {treino.exercicios.map((item) => (
                            <section className="border-t pt-3" key={item.nome}>
                                <h4 className="font-semibold">{item.nome}</h4>
                                <table className="mt-2 w-full text-left">
                                    <thead className="text-muted-foreground">
                                        <tr><th scope="col">Série</th><th scope="col">Repetições</th><th scope="col">Carga</th></tr>
                                    </thead>
                                    <tbody>
                                        {item.series.map((serie, indice) => (
                                            <tr className="border-b" key={indice}>
                                                <td className="py-1.5">{indice + 1}</td><td>{serie.repeticoes}</td><td>{serie.cargaKg} kg</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        ))}
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}

export default function PaginaComunidade() {
    const { user, logout, isAdmin, enviando: saindo } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);
    const [publicacoes, setPublicacoes] = useState(feedInicial);
    const [amigos, setAmigos] = useState(["luis", "mateus"]);
    const [texto, setTexto] = useState("");
    const [foto, setFoto] = useState<Publicacao["foto"]>();
    const [lendoFoto, setLendoFoto] = useState(false);
    const [erroFoto, setErroFoto] = useState("");
    const [treino, setTreino] = useState<TreinoRealizado>();
    const [historicoAberto, setHistoricoAberto] = useState(false);
    const [limite, setLimite] = useState(tamanhoPagina);
    const [aviso, setAviso] = useState("");
    const inputFoto = useRef<HTMLInputElement>(null);

    function adicionarAmigo(id: string) {
        setAmigos((lista) => lista.includes(id) ? lista : [...lista, id]);
    }

    function selecionarFoto(arquivo: File) {
        setErroFoto("");
        setLendoFoto(true);
        const leitor = new FileReader();
        leitor.onload = () => {
            setFoto({ src: String(leitor.result), alt: "Foto da publicação" });
            setLendoFoto(false);
        };
        leitor.onerror = () => {
            setErroFoto("Não foi possível abrir a foto.");
            setLendoFoto(false);
        };
        leitor.readAsDataURL(arquivo);
    }

    function publicar(evento: FormEvent<HTMLFormElement>) {
        evento.preventDefault();
        if (lendoFoto || (!texto.trim() && !foto && !treino)) return;

        const novaPublicacao: Publicacao = {
            id: crypto.randomUUID(),
            autor: user?.nome && user.nome !== user.email ? user.nome : "Você",
            data: new Date().toISOString(),
            texto: texto.trim(),
            foto,
            treino,
            curtidas: 0,
            comentarios: 0,
        };

        setPublicacoes((lista) => [novaPublicacao, ...lista]);
        setTexto("");
        setFoto(undefined);
        setTreino(undefined);
        setErroFoto("");
        setAviso("Publicação adicionada ao feed.");
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Aside {...{ menuAberto, setMenuAberto, isAdmin, logout, saindo }} />
            <div className="flex min-w-0 flex-1 flex-col">
                <Header email={user?.email ?? ""} {...{ menuAberto, setMenuAberto }} title="MotivaFit" subtitle="" />
                <main className="mx-auto w-full max-w-[1008px] px-4 py-6 sm:px-8">
                    <h2 className="mb-8 border-b border-foreground pb-6 font-heading text-4xl font-bold italic sm:text-5xl">Comunidade</h2>
                    <div className="grid gap-8 min-[850px]:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
                        <div className="min-w-0">
                            <form onSubmit={publicar} className="mb-6 flex flex-col gap-3 bg-muted/60 p-4">
                                <textarea
                                    aria-label="Texto da publicação"
                                    placeholder="Compartilhe um resultado com o grupo..."
                                    value={texto}
                                    onChange={(evento) => { setTexto(evento.target.value); setAviso(""); }}
                                    className="min-h-24 w-full border bg-background p-3 text-sm"
                                />
                                <input
                                    ref={inputFoto}
                                    hidden
                                    type="file"
                                    accept="image/*"
                                    onChange={(evento) => {
                                        const arquivo = evento.target.files?.[0];
                                        if (arquivo) selecionarFoto(arquivo);
                                        evento.target.value = "";
                                    }}
                                />
                                <Button type="button" variant="outline" disabled={lendoFoto} className="self-start rounded-none" onClick={() => inputFoto.current?.click()}>
                                    <ImagePlus aria-hidden="true" />{lendoFoto ? "Carregando foto…" : "Adicionar foto"}
                                </Button>
                                {erroFoto && <p role="alert" className="text-sm text-destructive">{erroFoto}</p>}
                                {foto && (
                                    <div className="flex items-start gap-3">
                                        <img src={foto.src} alt="Prévia da foto" className="max-h-40 max-w-[75%] object-contain" />
                                        <Button type="button" variant="ghost" size="sm" onClick={() => setFoto(undefined)}>Remover foto</Button>
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                    <select
                                        aria-label="Anexar um treino realizado"
                                        value={treino?.id ?? ""}
                                        onChange={(evento) => setTreino(historico.find((item) => item.id === evento.target.value))}
                                        className="h-10 min-w-0 flex-1 border bg-background px-3 text-sm"
                                    >
                                        <option value="">Anexar um treino...</option>
                                        {treinosRecentes.map((item) => (
                                            <option key={item.id} value={item.id}>{item.nome} · {dataCurta.format(new Date(item.data))}</option>
                                        ))}
                                        {treino && !treinosRecentes.includes(treino) && (
                                            <option value={treino.id}>{treino.nome} · {dataCurta.format(new Date(treino.data))}</option>
                                        )}
                                    </select>
                                    <Dialog open={historicoAberto} onOpenChange={(aberto) => {
                                        setHistoricoAberto(aberto);
                                        if (aberto) setLimite(tamanhoPagina);
                                    }}>
                                        <DialogTrigger render={<Button type="button" variant="outline" className="rounded-none" />}>Ver mais</DialogTrigger>
                                        <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-none sm:max-w-lg">
                                            <DialogHeader className="pr-10">
                                                <DialogTitle className="text-lg">Treinos realizados</DialogTitle>
                                                <DialogDescription>Escolha uma sessão para compartilhar seus resultados.</DialogDescription>
                                            </DialogHeader>
                                            <ul className="divide-y border-y">
                                                {historico.slice(0, limite).map((item) => (
                                                    <li key={item.id}>
                                                        <button type="button" className="flex w-full flex-wrap justify-between gap-x-4 gap-y-1 px-2 py-3 text-left hover:bg-muted focus-visible:bg-muted" onClick={() => {
                                                            setTreino(item);
                                                            setHistoricoAberto(false);
                                                        }}>
                                                            <span>{item.nome}</span>
                                                            <time className="text-muted-foreground" dateTime={item.data}>{dataCurta.format(new Date(item.data))}</time>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                            {limite < historico.length && (
                                                <Button type="button" variant="outline" className={botaoContorno} onClick={() => setLimite((atual) => atual + tamanhoPagina)}>Carregar mais</Button>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <Button type="submit" disabled={lendoFoto || (!texto.trim() && !foto && !treino)} className="self-end rounded-none bg-foreground text-background hover:bg-foreground/85">Publicar</Button>
                            </form>
                            <p role="status" className="sr-only">{aviso}</p>
                            {publicacoes.map((post) => (
                                <article key={post.id} className="space-y-3 border-t border-foreground py-3 pb-6">
                                    <div className="flex items-start gap-3">
                                        <Inicial nome={post.autor} />
                                        <div className="mr-auto min-w-0 text-sm">
                                            <p className="font-semibold">{post.autor}</p>
                                            <time dateTime={post.data} className="font-mono text-xs text-muted-foreground">{dataPublicacao.format(new Date(post.data))}</time>
                                        </div>
                                        {post.recorde && <span className="bg-[#ed390b] px-2 py-0.5 font-mono text-xs text-white">PR</span>}
                                        {post.amigoId && (amigos.includes(post.amigoId)
                                            ? <span className="border px-2 py-1 text-xs text-muted-foreground">✓ Amigo</span>
                                            : <Button type="button" variant="outline" size="sm" className={`h-7 px-2 text-xs ${botaoContorno}`} onClick={() => adicionarAmigo(post.amigoId ?? "")}>+ Adicionar</Button>)}
                                    </div>
                                    {post.texto && <p className="whitespace-pre-wrap wrap-break-word font-heading text-lg">{post.texto}</p>}
                                    {post.foto && <img src={post.foto.src} alt={post.foto.alt} className="max-h-[440px] w-full object-cover" />}
                                    {post.treino && <AnexoTreino treino={post.treino} />}
                                    <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                                        <button type="button" className="inline-flex items-center gap-1.5 aria-pressed:text-[#d83009]" aria-label="Curtir publicação" aria-pressed={Boolean(post.curtida)} onClick={() => {
                                            setPublicacoes((lista) => lista.map((item) => item.id === post.id
                                                ? { ...item, curtida: !item.curtida, curtidas: item.curtidas + (item.curtida ? -1 : 1) }
                                                : item));
                                        }}><Heart aria-hidden="true" size={12} fill={post.curtida ? "currentColor" : "none"} />{post.curtidas}</button>
                                        <span>{post.comentarios} {post.comentarios === 1 ? "comentário" : "comentários"}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <aside aria-label="Amigos da comunidade" className="space-y-6">
                            <section>
                                <h3 className={`border-b border-foreground pb-2 ${rotulo}`}>Meus amigos ({amigos.length})</h3>
                                <ul className="divide-y border-b">
                                    {pessoas.filter((pessoa) => amigos.includes(pessoa.id)).map((pessoa) => (
                                        <li key={pessoa.id} className="flex items-center gap-2.5 py-2">
                                            <Inicial nome={pessoa.nome} />
                                            <span className="mr-auto text-sm font-semibold">{pessoa.nome}</span>
                                            <button type="button" aria-label={`Remover ${pessoa.nome}`} className="text-xs text-muted-foreground underline" onClick={() => setAmigos((lista) => lista.filter((id) => id !== pessoa.id))}>remover</button>
                                        </li>
                                    ))}
                                    {amigos.length === 0 && <li className="py-2 text-sm text-muted-foreground">Nenhum amigo adicionado.</li>}
                                </ul>
                            </section>
                            <section>
                                <h3 className={`border-b border-foreground pb-2 ${rotulo}`}>Sugestões</h3>
                                <ul className="divide-y border-b">
                                    {pessoas.filter((pessoa) => !amigos.includes(pessoa.id)).map((pessoa) => (
                                        <li key={pessoa.id} className="flex items-center gap-2.5 py-2">
                                            <Inicial nome={pessoa.nome} />
                                            <div className="mr-auto">
                                                <p className="text-sm font-semibold">{pessoa.nome}</p>
                                                <p className="text-xs text-muted-foreground">{pessoa.descricao}</p>
                                            </div>
                                            <Button type="button" variant="outline" size="icon" className={`size-7 ${botaoContorno}`} aria-label={`Adicionar ${pessoa.nome}`} onClick={() => adicionarAmigo(pessoa.id)}><Plus aria-hidden="true" /></Button>
                                        </li>
                                    ))}
                                    {amigos.length === pessoas.length && <li className="py-2 text-sm text-muted-foreground">Nenhuma sugestão disponível.</li>}
                                </ul>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}

import { useEffect, useState, type ChangeEvent } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    atualizarExercicioCatalogo,
    criarExercicioCatalogo,
    desativarExercicioCatalogo,
    listarCatalogoExercicios,
} from "@/lib/api/catalogo-exercicios-api";
import type { CatalogoExercicioResponseDTO, ModalidadeBackend } from "@/lib/api/contracts";

export default function PaginaCatalogoAdmin() {
    const [itens, setItens] = useState<CatalogoExercicioResponseDTO[]>([]);
    const [nome, setNome] = useState("");
    const [grupoMuscular, setGrupoMuscular] = useState("");
    const [modalidade, setModalidade] = useState<ModalidadeBackend>("MUSCULACAO");
    const [imagemUrl, setImagemUrl] = useState("");
    const [editando, setEditando] = useState<CatalogoExercicioResponseDTO | null>(null);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [tentativa, setTentativa] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        listarCatalogoExercicios(controller.signal).then(setItens, (error: unknown) =>
            setErro(error instanceof Error ? error.message : "Não foi possível carregar o catálogo."));
        return () => controller.abort();
    }, [tentativa]);

    async function salvar() {
        setErro(""); setEnviando(true);
        try {
            if (editando) {
                await atualizarExercicioCatalogo(editando.id, { nome: nome.trim(), modalidade, grupoMuscular: grupoMuscular.trim(), imagemUrl });
            } else {
                await criarExercicioCatalogo({ nome: nome.trim(), modalidade, grupoMuscular: grupoMuscular.trim(), imagemUrl });
            }
            setNome(""); setGrupoMuscular(""); setImagemUrl(""); setEditando(null); setTentativa((valor) => valor + 1);
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível salvar o exercício.");
        } finally {
            setEnviando(false);
        }
    }

    async function desativar(id: number) {
        setErro(""); setEnviando(true);
        try {
            await desativarExercicioCatalogo(id);
            setTentativa((valor) => valor + 1);
        } catch (error) {
            setErro(error instanceof Error ? error.message : "Não foi possível desativar o exercício.");
        } finally {
            setEnviando(false);
        }
    }

    function editar(item: CatalogoExercicioResponseDTO) {
        setEditando(item); setNome(item.nome); setGrupoMuscular(item.grupoMuscular); setModalidade(item.modalidade); setImagemUrl(item.imagemUrl || "");
    }

    function selecionarImagem(event: ChangeEvent<HTMLInputElement>) {
        const arquivo = event.target.files?.[0];
        if (!arquivo) return;
        if (!arquivo.type.startsWith("image/")) {
            setErro("Selecione um arquivo de imagem válido.");
            event.target.value = "";
            return;
        }
        if (arquivo.size > 800 * 1024) {
            setErro("A imagem deve ter no máximo 800 KB.");
            event.target.value = "";
            return;
        }
        setErro("");
        const leitor = new FileReader();
        leitor.onload = () => setImagemUrl(typeof leitor.result === "string" ? leitor.result : "");
        leitor.onerror = () => setErro("Não foi possível carregar a imagem selecionada.");
        leitor.readAsDataURL(arquivo);
    }

    return <AdminLayout title="Catálogo de Exercícios">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card>
                <CardHeader><CardTitle>Exercícios ativos</CardTitle><CardDescription>Itens disponíveis para montar treinos.</CardDescription></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    {itens.map((item) => <div key={item.id} className="rounded-lg border p-3">
                        {item.imagemUrl && <img src={item.imagemUrl} alt={item.nome} className="mb-3 h-32 w-full rounded-md object-contain" />}
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">{item.grupoMuscular} · {item.modalidade}</p>
                        <div className="mt-3 flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => editar(item)}>Editar</Button>
                            <Button type="button" size="sm" variant="destructive" onClick={() => void desativar(item.id)} disabled={enviando}>Desativar</Button>
                        </div>
                    </div>)}
                    {itens.length === 0 && <p className="text-sm text-muted-foreground">Nenhum exercício ativo.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{editando ? "Editar exercício" : "Novo exercício"}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-1.5"><Label htmlFor="catalogo-nome">Nome</Label><Input id="catalogo-nome" value={nome} onChange={(event) => setNome(event.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor="catalogo-grupo">Grupo muscular</Label><Input id="catalogo-grupo" value={grupoMuscular} onChange={(event) => setGrupoMuscular(event.target.value)} /></div>
                    <div className="space-y-1.5"><Label htmlFor="catalogo-modalidade">Modalidade</Label>
                        <select id="catalogo-modalidade" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={modalidade} onChange={(event) => setModalidade(event.target.value as ModalidadeBackend)}>
                            <option value="MUSCULACAO">Musculação</option><option value="AEROBICO">Aeróbico</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="catalogo-imagem">Imagem do exercício *</Label>
                        <Input id="catalogo-imagem" type="file" accept="image/*" onChange={selecionarImagem} />
                        <p className="text-xs text-muted-foreground">Obrigatória para criar ou atualizar o exercício. Máximo: 800 KB.</p>
                        {imagemUrl && <img src={imagemUrl} alt="Prévia do exercício" className="h-40 w-full rounded-md border object-contain" />}
                    </div>
                    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
                    <div className="flex gap-2">
                        <Button type="button" onClick={() => void salvar()} disabled={enviando || !nome.trim() || !grupoMuscular.trim() || !imagemUrl.trim()}>{enviando ? "Salvando…" : "Salvar"}</Button>
                        {editando && <Button type="button" variant="outline" onClick={() => { setEditando(null); setNome(""); setGrupoMuscular(""); setImagemUrl(""); }}>Cancelar</Button>}
                    </div>
                </CardContent>
            </Card>
        </div>
    </AdminLayout>;
}

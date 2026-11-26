import { useState } from "react";
import { Dumbbell, ZoomIn } from "lucide-react";
import { obterImagemExercicio } from "@/lib/exercicios-imagens";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface ImagemExercicioProps {
    nome: string;
    tamanho?: "thumb" | "sm" | "md" | "lg" | "banner";
    className?: string;
    comZoom?: boolean;
    priorizarAspecto?: "contain" | "cover";
}

const DIMENSOES = {
    thumb: "h-12 w-12 min-w-12 rounded-md",
    sm: "h-16 w-16 min-w-16 rounded-lg",
    md: "h-24 w-24 min-w-24 rounded-lg",
    lg: "h-36 w-36 min-w-36 rounded-xl sm:h-44 sm:w-44 sm:min-w-44",
    banner: "h-48 w-full rounded-xl sm:h-64",
};

export default function ImagemExercicio({
    nome,
    tamanho = "sm",
    className = "",
    comZoom = true,
    priorizarAspecto = "contain",
}: ImagemExercicioProps) {
    const [erro, setErro] = useState(false);
    const [modalAberto, setModalAberto] = useState(false);
    const url = obterImagemExercicio(nome);

    const dimensoesClasse = DIMENSOES[tamanho] ?? DIMENSOES.sm;
    const objetoClasse = priorizarAspecto === "cover" ? "object-cover" : "object-contain p-1";

    if (!url || erro) {
        return (
            <div
                className={`flex shrink-0 items-center justify-center border border-border/60 bg-muted/40 text-muted-foreground ${dimensoesClasse} ${className}`}
                title={nome}
                aria-label={`Ilustração indisponível para ${nome}`}
            >
                <Dumbbell className="h-1/2 w-1/2 opacity-60" />
            </div>
        );
    }

    return (
        <>
            <div
                className={`group relative shrink-0 overflow-hidden border border-border/60 bg-white/5 dark:bg-black/20 ${dimensoesClasse} ${comZoom ? "cursor-pointer" : ""} ${className}`}
                onClick={comZoom ? () => setModalAberto(true) : undefined}
                role={comZoom ? "button" : undefined}
                tabIndex={comZoom ? 0 : undefined}
                onKeyDown={comZoom ? (e) => { if (e.key === "Enter" || e.key === " ") setModalAberto(true); } : undefined}
                aria-label={comZoom ? `Ver imagem ampliada de ${nome}` : undefined}
                title={comZoom ? `Clique para ampliar: ${nome}` : nome}
            >
                <img
                    src={url}
                    alt={`Ilustração do exercício ${nome}`}
                    loading="lazy"
                    onError={() => setErro(true)}
                    className={`h-full w-full transition-transform duration-200 group-hover:scale-105 ${objetoClasse}`}
                />
                {comZoom && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                )}
            </div>

            {comZoom && (
                <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                    <DialogContent className="max-w-lg p-6 text-center">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-heading font-bold">{nome}</DialogTitle>
                        </DialogHeader>
                        <div className="my-4 flex items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/20 p-4">
                            <img
                                src={url}
                                alt={`Ilustração detalhada de ${nome}`}
                                className="max-h-[60vh] max-w-full object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}


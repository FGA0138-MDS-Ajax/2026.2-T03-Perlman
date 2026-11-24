import { useEffect, useRef, useState } from "react";

const SCRIPT_GIS = "https://accounts.google.com/gsi/client";

interface CredencialGoogle { credential?: string }
interface GoogleIdentity {
    accounts: {
        id: {
            initialize: (config: { client_id: string; callback: (resposta: CredencialGoogle) => void; ux_mode?: "popup" }) => void;
            renderButton: (elemento: HTMLElement, opcoes: Record<string, string | number>) => void;
        };
    };
}
declare global {
    interface Window { google?: GoogleIdentity }
}

let carregamento: Promise<GoogleIdentity> | null = null;
function carregarGoogleIdentity(): Promise<GoogleIdentity> {
    if (window.google?.accounts?.id) return Promise.resolve(window.google);
    carregamento ??= new Promise<GoogleIdentity>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = SCRIPT_GIS;
        script.async = true;
        script.defer = true;
        script.onload = () => window.google?.accounts?.id ? resolve(window.google) : reject(new Error("Google indisponível"));
        script.onerror = () => { carregamento = null; reject(new Error("Google indisponível")); };
        document.head.appendChild(script);
    });
    return carregamento;
}

/**
 * Botão oficial do Google Identity Services. Entrega o ID Token para `onCredencial`,
 * que deve trocá-lo por uma sessão em POST /api/auth/google.
 */
export default function BotaoGoogle({ onCredencial, onErro, texto = "signin_with", desabilitado = false }: {
    onCredencial: (idToken: string) => void;
    onErro: (mensagem: string) => void;
    texto?: "signin_with" | "signup_with" | "continue_with";
    desabilitado?: boolean;
}) {
    const container = useRef<HTMLDivElement>(null);
    const callback = useRef(onCredencial);
    const erro = useRef(onErro);
    const [indisponivel, setIndisponivel] = useState(false);
    useEffect(() => {
        callback.current = onCredencial;
        erro.current = onErro;
    }, [onCredencial, onErro]);
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID ?? "";

    useEffect(() => {
        if (!clientId) return;
        let ativo = true;
        carregarGoogleIdentity().then((google) => {
            if (!ativo || !container.current) return;
            google.accounts.id.initialize({
                client_id: clientId,
                ux_mode: "popup",
                callback: (resposta) => {
                    if (resposta.credential) callback.current(resposta.credential);
                    else erro.current("O Google não retornou uma credencial. Tente novamente.");
                },
            });
            container.current.replaceChildren();
            google.accounts.id.renderButton(container.current, {
                type: "standard", theme: "outline", size: "large", text: texto, shape: "rectangular",
                width: Math.min(400, container.current.clientWidth || 320), locale: "pt-BR",
            });
        }, () => { if (ativo) setIndisponivel(true); });
        return () => { ativo = false; };
    }, [clientId, texto]);

    if (!clientId) return null;
    if (indisponivel) return <p className="text-center text-xs text-muted-foreground">Não foi possível carregar o login com Google.</p>;
    return <div ref={container} aria-busy={desabilitado} className={`flex w-full justify-center ${desabilitado ? "pointer-events-none opacity-60" : ""}`} />;
}

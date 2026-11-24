export type PerfilBackend = "USUARIO" | "ADMINISTRADOR" | "SUPERUSUARIO";
export type TipoTreinoBackend = "MUSCULACAO" | "AEROBICO";
export type VisibilidadeBackend = "PRIVADO" | "PUBLICO";
export type ModalidadeBackend = "MUSCULACAO" | "AEROBICO";

export interface UsuarioResponseDTO {
    id: number;
    email: string;
    perfil: PerfilBackend;
    ativo: boolean;
}

export interface LoginResponseDTO {
    token: string;
    expirationAt: string;
}

export interface LoginRequestDTO {
    email: string;
    senha: string;
}

export interface UsuarioRequestDTO {
    email: string;
    senha: string;
}

export interface JwtUsuarioClaims {
    sub: string;
    id: number;
    ativo: boolean;
    perfil: PerfilBackend;
    iss: string;
    iat: number;
    exp: number;
}

export interface TreinoRequestDTO {
    nome: string;
    tipo: TipoTreinoBackend;
    visibilidade?: VisibilidadeBackend;
}

export interface TreinoResponseDTO {
    id: number;
    nome: string;
    tipo: TipoTreinoBackend;
    visibilidade: VisibilidadeBackend;
    createdAt: string;
    updatedAt: string;
    meuTreino: boolean;
    podeEditar: boolean;
}

export interface ExercicioRequestDTO {
    meta: string;
    metaRecorde?: string | null;
    treinoId: number;
    catalogoExercicioId: number;
}

export interface ExercicioResponseDTO {
    id: number;
    meta: string;
    metaRecorde: string | null;
    treinoId: number;
    catalogoExercicioId: number;
}

export interface CatalogoExercicioRequestDTO {
    nome: string;
    modalidade: ModalidadeBackend;
    grupoMuscular: string;
    imagemUrl?: string;
}

export interface CatalogoExercicioResponseDTO {
    id: number;
    nome: string;
    modalidade: ModalidadeBackend;
    grupoMuscular: string;
    imagemUrl?: string | null;
}

export interface RegistroDiarioRequestDTO {
    catalogoId: number;
    treinoId?: number;
    exercicioId?: number;
    cargaKg?: number;
    repeticoes?: number;
    series?: number;
    tempoS: number;
    distanciaM?: number;
    chaveIdempotencia?: string;
}

export interface RegistroDiarioResponseDTO {
    id: number;
    catalogoId: number;
    treinoId: number | null;
    exercicioId: number | null;
    treinoNome: string | null;
    exercicioNome: string;
    cargaKg: number | null;
    repeticoes: number | null;
    series: number | null;
    tempoS: number;
    distanciaM: number | null;
    executadoEm: string;
}

export interface ApiErroResponse {
    codigo: string;
    mensagem: string;
    dataHora: string;
}

export interface GoogleLoginRequestDTO {
    idToken: string;
}

// ---------------------------------------------------------------------------
// Desafios
// ---------------------------------------------------------------------------
export type EstadoDesafio = "ATIVO" | "CANCELADO";
export type EstadoParticipante = "CONVIDADO" | "ACEITO" | "RECUSADO";

export interface DesafioItemRequestDTO {
    catalogoId: number;
    metaCargaKg?: number | null;
    metaRepeticoes?: number | null;
    metaSeries?: number | null;
    metaTempoS?: number | null;
    metaDistanciaM?: number | null;
}

export interface DesafioRequestDTO {
    titulo: string;
    prazo: string;
    descricao?: string;
    visibilidade?: VisibilidadeBackend;
    itens: DesafioItemRequestDTO[];
}

export interface DesafioItemResponseDTO {
    id: number;
    catalogoId: number;
    exercicioNome: string;
    modalidade: ModalidadeBackend;
    metaCargaKg: number | null;
    metaRepeticoes: number | null;
    metaSeries: number | null;
    metaTempoS: number | null;
    metaDistanciaM: number | null;
}

export interface DesafioResponseDTO {
    id: number;
    titulo: string;
    prazo: string;
    descricao: string | null;
    visibilidade: VisibilidadeBackend;
    estado: EstadoDesafio;
    souCriador: boolean;
    itens: DesafioItemResponseDTO[];
}

export interface DesafioParticipanteResponseDTO {
    usuarioId: number;
    email: string;
    estado: EstadoParticipante;
    aceitoEm: string | null;
}

// ---------------------------------------------------------------------------
// Amizades
// ---------------------------------------------------------------------------
export type EstadoAmizade = "PENDENTE" | "ACEITA" | "RECUSADA";

export interface AmizadeResponseDTO {
    id: number;
    solicitanteId: number;
    solicitanteEmail: string;
    destinatarioId: number;
    destinatarioEmail: string;
    estado: EstadoAmizade;
    criadoEm: string;
    atualizadoEm: string;
}

// ---------------------------------------------------------------------------
// Grupos
// ---------------------------------------------------------------------------
export type PapelGrupo = "ADMIN" | "MEMBRO";

export interface GrupoRequestDTO {
    nome: string;
    descricao?: string;
}

export interface GrupoResponseDTO {
    id: number;
    nome: string;
    descricao: string | null;
    criadorId: number;
    papel: PapelGrupo;
    criadoEm: string;
    atualizadoEm: string;
}

export interface GrupoMembroResponseDTO {
    usuarioId: number;
    email: string;
    papel: PapelGrupo;
    entradaEm: string;
}

export interface ConviteGrupoResponseDTO {
    id: number;
    grupoId: number;
    convidadoId: number;
    token: string;
    expiraEm: string;
}

export interface GrupoFeedResponseDTO {
    id: number;
    usuarioId: number;
    tipo: string;
    conteudo: string;
    criadoEm: string;
}

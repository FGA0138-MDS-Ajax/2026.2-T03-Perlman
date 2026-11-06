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
}

export interface CatalogoExercicioResponseDTO {
    id: number;
    nome: string;
    modalidade: ModalidadeBackend;
    grupoMuscular: string;
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
    exercicioNome: string;
    tempoS: number;
}

export interface ApiErroResponse {
    codigo: string;
    mensagem: string;
    dataHora: string;
}

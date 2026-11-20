CREATE TABLE IF NOT EXISTS grupo (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(1000),
    criador_id BIGINT NOT NULL REFERENCES usuario(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS grupo_membro (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    papel VARCHAR(20) NOT NULL,
    entrada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_grupo_membro UNIQUE (grupo_id, usuario_id),
    CONSTRAINT ck_grupo_membro_papel CHECK (papel IN ('ADMIN', 'MEMBRO'))
);
CREATE INDEX IF NOT EXISTS idx_grupo_membro_usuario ON grupo_membro(usuario_id);

CREATE TABLE IF NOT EXISTS convite_grupo (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    convidante_id BIGINT NOT NULL REFERENCES usuario(id),
    convidado_id BIGINT NOT NULL REFERENCES usuario(id),
    token VARCHAR(36) NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    expira_em TIMESTAMPTZ NOT NULL,
    CONSTRAINT ck_convite_grupo_estado CHECK (estado IN ('PENDENTE', 'ACEITO', 'CANCELADO', 'EXPIRADO'))
);

CREATE TABLE IF NOT EXISTS grupo_feed_post (
    id BIGSERIAL PRIMARY KEY,
    grupo_id BIGINT NOT NULL REFERENCES grupo(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
    tipo VARCHAR(40) NOT NULL,
    conteudo VARCHAR(1000) NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_grupo_feed_grupo_em ON grupo_feed_post(grupo_id, criado_em DESC);

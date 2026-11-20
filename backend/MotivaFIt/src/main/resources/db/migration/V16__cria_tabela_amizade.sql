CREATE TABLE IF NOT EXISTS amizade (
                         id BIGSERIAL PRIMARY KEY,
                         solicitante_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                         destinatario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                         estado VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
                         criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
                         atualizado_em TIMESTAMPTZ,

                         CONSTRAINT uq_amizade UNIQUE (solicitante_id, destinatario_id),
                         CONSTRAINT ck_amizade_nao_mesmo_usuario CHECK (solicitante_id <> destinatario_id),
                         CONSTRAINT ck_amizade_estado CHECK (estado IN ('PENDENTE', 'ACEITA', 'RECUSADA'))
);

CREATE INDEX IF NOT EXISTS idx_amizade_destinatario
    ON amizade (destinatario_id);

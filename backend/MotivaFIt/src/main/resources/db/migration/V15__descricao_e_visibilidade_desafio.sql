ALTER TABLE desafio
    ADD COLUMN IF NOT EXISTS descricao VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS visibilidade VARCHAR(20) NOT NULL DEFAULT 'PRIVADO',
    ADD CONSTRAINT ck_desafio_visibilidade CHECK (visibilidade IN ('PRIVADO', 'PUBLICO'));

CREATE INDEX IF NOT EXISTS idx_desafio_visibilidade ON desafio (visibilidade);

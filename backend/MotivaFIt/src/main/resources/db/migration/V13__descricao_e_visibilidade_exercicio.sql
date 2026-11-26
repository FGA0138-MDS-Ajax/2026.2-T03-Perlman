ALTER TABLE exercicio
    ADD COLUMN IF NOT EXISTS descricao VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS visibilidade VARCHAR(20) NOT NULL DEFAULT 'PRIVADO',
    ADD CONSTRAINT ck_exercicio_visibilidade CHECK (visibilidade IN ('PRIVADO', 'PUBLICO'));

CREATE INDEX IF NOT EXISTS idx_exercicio_visibilidade ON exercicio (visibilidade);

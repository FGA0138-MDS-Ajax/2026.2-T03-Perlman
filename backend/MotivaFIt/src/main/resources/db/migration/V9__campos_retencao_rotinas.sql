ALTER TABLE usuario ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE treino ADD COLUMN IF NOT EXISTS treino_origem_id BIGINT REFERENCES treino(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_treino_origem_id ON treino (treino_origem_id);

ALTER TABLE exercicio
    DROP CONSTRAINT IF EXISTS ck_exercicio_visibilidade,
    DROP COLUMN IF EXISTS descricao,
    DROP COLUMN IF EXISTS visibilidade;

DROP INDEX IF EXISTS idx_exercicio_visibilidade;

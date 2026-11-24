ALTER TABLE usuario ADD COLUMN IF NOT EXISTS tema VARCHAR(10) NOT NULL DEFAULT 'system';
ALTER TABLE usuario ADD CONSTRAINT ck_usuario_tema CHECK (tema IN ('light', 'dark', 'system'));

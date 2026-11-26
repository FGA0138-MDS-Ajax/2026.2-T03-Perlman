CREATE INDEX IF NOT EXISTS idx_registro_usuario_executado ON registro_diario (usuario_id, executado_em);
CREATE INDEX IF NOT EXISTS idx_registro_executado_usuario ON registro_diario (executado_em, usuario_id);
CREATE INDEX IF NOT EXISTS idx_registro_catalogo_executado ON registro_diario (catalogo_id, executado_em);

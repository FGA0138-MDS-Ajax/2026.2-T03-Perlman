CREATE TABLE registro_diario (
                                 id BIGSERIAL PRIMARY KEY,
                                 usuario_id BIGINT NOT NULL REFERENCES usuario(id),
                                 catalogo_id BIGINT NOT NULL REFERENCES catalogo_exercicio(id),
                                 treino_id BIGINT REFERENCES treino(id) ON DELETE SET NULL,
                                 exercicio_id BIGINT REFERENCES exercicio(id) ON DELETE SET NULL,
                                 treino_nome VARCHAR(150),
                                 exercicio_nome VARCHAR(100) NOT NULL,
                                 carga_kg NUMERIC(8,2),
                                 repeticoes INTEGER,
                                 series INTEGER,
                                 tempo_s INTEGER,
                                 distancia_m NUMERIC(10,2),
                                 executado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
                                 chave_idempotencia VARCHAR(100),
                                 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                                 CONSTRAINT ck_registro_diario_carga
                                     CHECK (carga_kg IS NULL OR carga_kg >= 0),
                                 CONSTRAINT ck_registro_diario_repeticoes
                                     CHECK (repeticoes IS NULL OR repeticoes > 0),
                                 CONSTRAINT ck_registro_diario_series
                                     CHECK (series IS NULL OR series > 0),
                                 CONSTRAINT ck_registro_diario_tempo
                                     CHECK (tempo_s IS NULL OR tempo_s > 0),
                                 CONSTRAINT ck_registro_diario_distancia
                                     CHECK (distancia_m IS NULL OR distancia_m > 0),
                                 CONSTRAINT ck_registro_diario_alguma_metrica
                                     CHECK (carga_kg IS NOT NULL OR repeticoes IS NOT NULL OR series IS NOT NULL
                                         OR tempo_s IS NOT NULL OR distancia_m IS NOT NULL)
);

CREATE INDEX idx_registro_diario_usuario_executado
    ON registro_diario (usuario_id, executado_em DESC);

CREATE INDEX idx_registro_diario_executado_em
    ON registro_diario (executado_em);

CREATE UNIQUE INDEX uq_registro_diario_usuario_chave
    ON registro_diario (usuario_id, chave_idempotencia)
    WHERE chave_idempotencia IS NOT NULL;
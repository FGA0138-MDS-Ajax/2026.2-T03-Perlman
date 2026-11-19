CREATE TABLE desafio (
                         id BIGSERIAL PRIMARY KEY,
                         criador_id BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
                         titulo VARCHAR(100) NOT NULL,
                         prazo DATE NOT NULL,
                         estado VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
                         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                         CONSTRAINT ck_desafio_estado
                             CHECK (estado IN ('ATIVO', 'CANCELADO'))
);

CREATE TABLE desafio_item (
                              id BIGSERIAL PRIMARY KEY,
                              desafio_id BIGINT NOT NULL REFERENCES desafio(id) ON DELETE CASCADE,
                              catalogo_id BIGINT NOT NULL REFERENCES catalogo_exercicio(id),
                              meta_carga_kg NUMERIC(8,2),
                              meta_repeticoes INTEGER,
                              meta_series INTEGER,
                              meta_tempo_s INTEGER,
                              meta_distancia_m NUMERIC(10,2),

                              CONSTRAINT uq_desafio_item_catalogo
                                  UNIQUE (desafio_id, catalogo_id),
                              CONSTRAINT ck_desafio_item_carga
                                  CHECK (meta_carga_kg IS NULL OR meta_carga_kg >= 0),
                              CONSTRAINT ck_desafio_item_repeticoes
                                  CHECK (meta_repeticoes IS NULL OR meta_repeticoes > 0),
                              CONSTRAINT ck_desafio_item_series
                                  CHECK (meta_series IS NULL OR meta_series > 0),
                              CONSTRAINT ck_desafio_item_tempo
                                  CHECK (meta_tempo_s IS NULL OR meta_tempo_s > 0),
                              CONSTRAINT ck_desafio_item_distancia
                                  CHECK (meta_distancia_m IS NULL OR meta_distancia_m > 0),
                              CONSTRAINT ck_desafio_item_alguma_meta
                                  CHECK (meta_carga_kg IS NOT NULL OR meta_repeticoes IS NOT NULL OR meta_series IS NOT NULL
                                      OR meta_tempo_s IS NOT NULL OR meta_distancia_m IS NOT NULL)
);

CREATE TABLE desafio_participante (
                                      id BIGSERIAL PRIMARY KEY,
                                      desafio_id BIGINT NOT NULL REFERENCES desafio(id) ON DELETE CASCADE,
                                      usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
                                      estado VARCHAR(20) NOT NULL,
                                      aceito_em TIMESTAMPTZ,

                                      CONSTRAINT uq_desafio_participante
                                          UNIQUE (desafio_id, usuario_id),
                                      CONSTRAINT ck_desafio_participante_estado
                                          CHECK (estado IN ('CONVIDADO', 'ACEITO', 'RECUSADO'))
);

CREATE INDEX idx_desafio_participante_usuario
    ON desafio_participante (usuario_id);
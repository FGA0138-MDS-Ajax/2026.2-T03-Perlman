CREATE TABLE treino (
                        id BIGSERIAL PRIMARY KEY,
                        usuario_id BIGINT NOT NULL REFERENCES usuario(id),
                        nome VARCHAR(150) NOT NULL,
                        tipo VARCHAR(20) NOT NULL,
                        visibilidade VARCHAR(20) NOT NULL DEFAULT 'PRIVADO',
                        excluido_em TIMESTAMPTZ,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                        CONSTRAINT ck_treino_tipo
                            CHECK (tipo IN ('MUSCULACAO', 'AEROBICO')),
                        CONSTRAINT ck_treino_visibilidade
                            CHECK (visibilidade IN ('PRIVADO', 'PUBLICO'))
);

CREATE INDEX idx_treino_usuario_id ON treino (usuario_id);
 
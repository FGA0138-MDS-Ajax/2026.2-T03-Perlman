CREATE TABLE exercicio (
                           id BIGSERIAL PRIMARY KEY,
                           meta VARCHAR(255) NOT NULL,
                           meta_recorde VARCHAR(255),
                           treino_id BIGINT NOT NULL,
                           catalogo_exercicio_id BIGINT NOT NULL,
                           CONSTRAINT fk_exercicio_treino FOREIGN KEY (treino_id) REFERENCES treino (id),
                           CONSTRAINT fk_exercicio_catalogo FOREIGN KEY (catalogo_exercicio_id) REFERENCES catalogo_exercicio (id)
);
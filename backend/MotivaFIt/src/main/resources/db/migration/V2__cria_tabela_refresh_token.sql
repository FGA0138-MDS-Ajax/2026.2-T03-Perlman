CREATE TABLE refresh_token (
    id BIGSERIAL PRIMARY KEY,
    hash VARCHAR(255) UNIQUE NOT NULL,
    familia VARCHAR(255) NOT NULL,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id),
    validade TIMESTAMP NOT NULL,
    revogacao TIMESTAMP
);
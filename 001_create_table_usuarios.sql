DROP TABLE IF EXISTS psicologo

DROP TABLE IF EXISTS contatos_emergencia

DROP TABLE IF EXISTS alertas

DROP TABLE IF EXISTS usuario

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    data_nascimento DATE,
    email VARCHAR(255) UNIQUE NOT NULL, 
    telefone VARCHAR(15),
    senha_hash VARCHAR(255) NOT NULL, 
    termos_aceitos BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_email ON usuario(email);
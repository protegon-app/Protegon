-- =========================================================
--  PROTEGON- SCHEMA (MySQL)
-- =========================================================

CREATE DATABASE IF NOT EXISTS Protegon_db;
USE Protegon_db;

-- Limpar tabelas se existirem
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS psicologo;
DROP TABLE IF EXISTS contatos_emergencia;
DROP TABLE IF EXISTS alertas;



-- USUÁRIOS
CREATE TABLE usuario (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(60) NOT NULL,
  email VARCHAR(60) NOT NULL,
  senha VARCHAR(30) NOT NULL,
  data_nascimento DATE NOT NULL,
  telefone VARCHAR(15) NOT NULL,
  cidade TEXT(25) NOT NULL,
  
  PRIMARY KEY (id_usuario),
  UNIQUE KEY (email)

) ENGINE = InnoDB;

-- PSICÓLOGO
CREATE TABLE psicologo (
    id_psicologo INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(30) NOT NULL,
    telefone VARCHAR(15) NULL,
    data_nascimento DATE NOT NULL,
    cidade TEXT(25) NOT NULL,
    id_usuario INT NOT NULL,
    
    PRIMARY KEY (id_psicologo),
    UNIQUE KEY (email),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
  
) ENGINE = InnoDB;

-- CONTATOS DE EMERGÊNCIA 
CREATE TABLE contatos_emergencia (
  id_contato INT NOT NULL AUTO_INCREMENT,
  nome_contato VARCHAR(100) NOT NULL,
  email_contato VARCHAR(100) NOT NULL,
  ​telefone_contato VARCHAR(20) NOT NULL,
  id_usuario INT NOT NULL,
 

  PRIMARY KEY (id_contato),
  UNIQUE KEY (email_contato),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
   ON DELETE CASCADE
   ON UPDATE CASCADE

) ENGINE = InnoDB;

-- ALERTAS

CREATE TABLE alertas (
    id_alerta INT NOT NULL AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    data_hora DATETIME NOT NULL,
    localizacao VARCHAR(500),
    tipo_alerta VARCHAR(100) NOT NULL,
    status_alerta VARCHAR(50) NOT NULL,


    PRIMARY KEY (id_alerta),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    
) ENGINE = InnoDB;


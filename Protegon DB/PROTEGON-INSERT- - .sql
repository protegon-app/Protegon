
-- =========================================================
--  SISTEMA PROTEGON - DADOS (MySQL)
-- =========================================================
USE protegon_db

-- USUARIOS
INSERT INTO usuario (id_usuario, nome, email, senha, data_nascimento, telefone, cidade)
VALUES
(1, 'Juliana Silva', 'juliana.silva@email.com', 'senha123', '1995-08-20', '62987654321', 'Trindade-GO'),
(2, 'Carla Almeida', 'carla.almeida@email.com', 'senha456', '2001-03-15', '62998877665', 'Goiânia-GO'),
(3, 'Mariana Santos', 'mariana.santos@email.com', 'senha789', '1988-11-25', '61912345678', 'Brasília-DF');



INSERT INTO psicologo (id_psicologo, nome, email, senha, data_nascimento, telefone,cidade, id_usuario)
VALUES
(101, 'Dr. Rafael Costa', 'rafael.costa@psico.com', 'psico123', '1999-06-10', '62987651234','Trindade - GO', 1), -- Psicólogo 101 acompanhando o Usuário 1
(102, 'Dra. Beatriz Leal', 'beatriz.leal@psico.com', 'psico456', '1980-09-01', '64998765432','Goiânia - GO', 2), -- Psicólogo 102 acompanhando o Usuário 2
(103, 'Dr. Cristiane Nunes', 'cristiane.nunes@psico.com', 'psico789', '1990-04-20', '31912340987','Brasília - DF', 1); -- Psicólogo 103 acompanhando o Usuário 1 (exemplo de 2 psicólogos para 1 usuário)


-- CONTATOS_EMERGENCIA
INSERT INTO contatos_emergencia (id_contato, nome_contato, telefone_contato, email_contato, id_usuario)
VALUES
(1, 'Mãe da Juliana', '62991112233', 'mae.juliana@email.com', 1), -- Contato para Juliana (id_usuario 1)
(2, 'Irmão da Carla', '64994445566', 'irmao.carla@email.com', 2), -- Contato para Carla (id_usuario 2)
(3, 'Vizinho da Mariana', '61993334455', NULL, 3), -- Contato para Mariana (id_usuario 3)
(4, 'Amigo da Juliana', '62996667788', 'amigo.ju@email.com', 1); -- Segundo Contato para Juliana (id_usuario 1)

-- ALERTAS
INSERT INTO alertas (id_alerta, id_usuario, data_hora, localizacao, tipo_alerta, status_alerta)
VALUES
(1, 1, '2025-09-14 14:30:00', 'Latitude: -30.0346, Longitude: -51.2177', 'manual', 'resolvido'), -- Alerta de Juliana
(2, 2, '2025-10-07 18:05:30', 'Rua Augusta, 1000, Goiânia-GO', 'deteccao_audio', 'aberto'), -- Alerta de Carla
(3, 1, '2025-08-31 19:15:45', 'Casa da Juliana', 'frequencia_cardiaca', 'falso_positivo'); -- Outro Alerta de Juliana

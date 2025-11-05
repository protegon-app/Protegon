# Protegon - Back-end (API)

Este é o diretório do back-end para a aplicação Protegon. Ele contém a API RESTful responsável por toda a lógica de negócio, autenticação e gerenciamento de dados com o banco de dados.

## 🚀 Tecnologias Principais

* **Python 3.10+**
* **FastAPI**: O framework principal da API.
* **SQLAlchemy**: O ORM (Tradutor) para comunicação com o banco de dados.
* **MySQL**: O banco de dados (pode ser trocado no `config.py`).
* **Pydantic**: Para validação de dados (`shecmas`).
* **JWT (python-jose)**: Para autenticação e segurança.
* **Bcrypt**: Para hashing (criptografia) de senhas.

---

## 🛠️ Configuração do Ambiente

Siga estes passos para configurar e rodar o projeto localmente.

### 1. Pré-requisitos

* Você precisa ter o **Python 3.10+** instalado.
* Você precisa ter um servidor **MySQL** rodando na sua máquina (ex: MySQL Community Server, XAMPP, WAMP).

### 2. Instalação

1.  **Navegue até a pasta**
    ```bash
    cd backend
    ```

2.  **Crie um Ambiente Virtual** (Recomendado)
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as Dependências**
    Use o `pip` para ler a "lista de compras" (`requirements.txt`):
    ```bash
    pip install -r requirements.txt
    ```

### 3. Configuração do Banco de Dados

1.  Acesse o seu MySQL (pelo MySQL Workbench, DBeaver, ou `mysql` no terminal).
2.  Crie um novo banco de dados (também chamado de "schema" no MySQL) para o projeto.
    ```sql
    CREATE DATABASE protegon_db;
    ```

### 4. Variáveis de Ambiente (.env)

Este projeto usa um arquivo `.env` para guardar informações sensíveis (senhas).

1.  Na pasta `backend/`, crie um arquivo chamado `.env`.
2.  Copie o conteúdo abaixo e **altere com suas próprias senhas**:

    ```env
    # URL de conexão do seu banco de dados
    # Formato: "mysql+mysqlconnector://USUARIO:SENHA@localhost:PORTA/NOME_DO_BANCO"
    DATABASE_URL="mysql+mysqlconnector://root:sua_senha_aqui@localhost:3306/protegon_db"
    
    # Chave secreta para criar os tokens JWT (pode ser qualquer string longa e aleatória)
    SECRET_KEY="sua-chave-secreta-muito-forte-aqui-123456"
    
    # O algorítmo para o JWT
    ALGORITHM="HS256"
    
    # Tempo de expiração do token (em minutos)
    ACCESS_TOKEN_EXPIRE_MINUTES=60
    ```
    
**IMPORTANTE:** Adicione o arquivo `.env` ao seu `.gitignore` para NUNCA enviá-lo para o GitHub.

---

## ▶️ Como Rodar a Aplicação

Com o ambiente virtual ativado e o `.env` configurado, inicie o servidor FastAPI:

```bash
uvicorn main:app --reload
```

* `main`: Refere-se ao arquivo `main.py`.
* `app`: Refere-se ao objeto `app = FastAPI()` dentro do arquivo `main.py`.
* `--reload`: Faz o servidor reiniciar automaticamente toda vez que você salvar uma alteração no código.

O servidor estará disponível em: **http://127.0.0.1:8000**

Para ver a documentação automática da API (Swagger), acesse: **http://127.0.0.1:8000/docs**

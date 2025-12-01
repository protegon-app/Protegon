# auth_controller.py

from flask import request, jsonify
from werkzeug.security import generate_password_hash

# Importe o UserService e o módulo de conexão diretamente aqui, se necessário.
# Exemplo: 
from Protegon.user_service import UserService 

# O código abaixo é a função de visualização LIMPA, sem o decorador do Blueprint.

def cadastrar_usuario():
    """
    Controlador para a rota POST /cadastrar.
    Valida os dados e insere um novo usuário no BD com hash de senha.
    """
    
    # 1. Instancie o serviço AQUI dentro da função (ou globalmente, se preferir)
    user_service = UserService() 
    
    dados = request.get_json()
    
    # 2. Validação de campos obrigatórios
    campos_obg = ['nome_completo', 'cpf', 'email', 'senha']
    if not dados or not all(campo in dados and dados[campo] for campo in campos_obg):
        return jsonify({
            "erro": "Campos obrigatórios faltando. Requer: nome_completo, cpf, email, senha."
        }), 400 # 400 Bad Request

    nome = dados['nome_completo']
    cpf = dados['cpf']
    email = dados['email']
    senha_limpa = dados['senha']
    
    # Adicionando valores padrão/opcionais
    data_nascimento = dados.get('data_nascimento')
    telefone = dados.get('telefone')
    termos_aceitos = dados.get('termos_aceitos', False)

    # 3. Checagem de duplicação (Integridade)
    try:
        if user_service.email_ou_cpf_existe(email, cpf):
            return jsonify({"erro": "E-mail ou CPF já cadastrados na base de dados."}), 409 # 409 Conflict

    except Exception as e:
        print(f"Erro na checagem de existência: {e}")
        return jsonify({"erro": "Erro interno de banco de dados."}), 500

    # 4. Criptografia da Senha (Segurança!)
    try:
        senha_hash = generate_password_hash(senha_limpa, method='pbkdf2:sha256:200000')
    except Exception as e:
        print(f"Erro ao gerar hash da senha: {e}")
        return jsonify({"erro": "Erro interno ao processar a senha."}), 500

    # 5. Persistir no Banco e Retorno
    novo_usuario_data = {
        'nome_completo': nome,
        'cpf': cpf,
        'data_nascimento': data_nascimento,
        'email': email,
        'telefone': telefone,
        'senha_hash': senha_hash,
        'termos_aceitos': termos_aceitos
    }

    try:
        usuario_criado = user_service.create_user(novo_usuario_data)
        
        # Resposta de Sucesso
        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso!",
            "usuario": usuario_criado
        }), 201 # 201 Created

    except Exception as e:
        print(f"Erro ao persistir usuário: {e}")
        return jsonify({"erro": "Erro interno ao cadastrar o usuário."}), 500
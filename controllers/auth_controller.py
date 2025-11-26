from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from Protegon.user_service import UserService

auth_bp = Blueprint('auth', __name__)
user_service = UserService() 

@auth_bp.route('/usuarios/cadastrar', methods=['POST'])
def cadastrar_usuario():
    dados = request.get_json()
    
    campos_obg = ['nome_completo', 'cpf', 'email', 'senha']
    
    if not dados or not all(campo in dados and dados[campo] for campo in campos_obg):
        return jsonify({
            "erro": "Campos obrigatórios faltando. Requer: nome_completo, cpf, email, senha."
        }), 400 
        
    email = dados['email']
    cpf = dados['cpf']
    senha_limpa = dados['senha']
    
    try:
        if user_service.email_ou_cpf_existe(email, cpf):
            return jsonify({
                "erro": "E-mail ou CPF já cadastrados na base de dados."
            }), 409 
    except Exception as e:
        print(f"Erro na checagem de existência: {e}")
        return jsonify({"erro": "Erro interno de banco de dados."}), 500

    try:
        senha_hash = generate_password_hash(senha_limpa, method='pbkdf2:sha256:200000')
    except Exception as e:
        print(f"Erro ao gerar hash da senha: {e}")
        return jsonify({"erro": "Erro interno ao processar a senha."}), 500

    novo_usuario_data = {
        'nome_completo': dados['nome_completo'],
        'cpf': dados['cpf'],
        'data_nascimento': dados.get('data_nascimento'), 
        'email': email,
        'telefone': dados.get('telefone'),              
        'senha_hash': senha_hash,                      
        'termos_aceitos': dados.get('termos_aceitos', False) 
    }
    try:
        usuario_criado = user_service.create_user(novo_usuario_data)
        
        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso!",
            "usuario": usuario_criado
        }), 201 

    except Exception as e:
        print(f"Erro ao persistir usuário: {e}")
        return jsonify({"erro": "Erro interno ao cadastrar o usuário."}), 500
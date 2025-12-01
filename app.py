from flask import Flask, request, jsonify
from argon2 import PasswordHasher
from argon2.exceptions import  VerifyMismatchError
import os
import sys


sys.path.append(os.path.abspath('database'))
from Protegon.db.init.db_connector import get_db_connection 

app = Flask(__name__)
ph = PasswordHasher()




@app.route('/api/cadastro', methods=['POST'])
def cadastrar_usuario():
   
    dados = request.get_json()
    
    required_fields = ['nome', 'email', 'senha', 'data_nascimento', 'telefone', 'cidade']
    
    if not all(field in dados for field in required_fields):
        return jsonify({"erro": "Dados incompletos."}), 400

    try:
        senha_hash = ph.hash(dados['senha'])
    except Exception as e:
        return jsonify({"erro": f"Falha ao processar senha: {str(e)}"}), 500

    
    conn = get_db_connection()
    if conn is None:
        return jsonify({"erro": "Falha na conexão com o banco de dados."}), 500

    cursor = conn.cursor()
    
    query = """
    INSERT INTO usuario 
    (nome, email, senha_hash, data_nascimento, telefone, cidade) 
    VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    values = (
        dados['nome'],
        dados['email'],
        senha_hash, 
        dados['data_nascimento'],
        dados['telefone'],
        dados['cidade']
    )
    
    try:
        cursor.execute(query, values)
        conn.commit()
        
        return jsonify({
            "mensagem": "Usuário cadastrado com sucesso!", 
            "id_usuario": cursor.lastrowid
        }), 201

    except Error as e:
        
        if 'Duplicate entry' in str(e) and 'email' in str(e):
             return jsonify({"erro": "Este e-mail já está cadastrado."}), 409
        
        print(f"Erro SQL: {e}")
        return jsonify({"erro": f"Erro interno ao cadastrar: {str(e)}"}), 500
        
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    
    app.run(host='0.0.0.0', port=8000, debug=True)
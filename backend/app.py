from flask import Flask, request, jsonify
from flask_cors import CORS
import bcrypt
import mysql.connector 
from db_connector import init_db, get_db_connection 

app = Flask(__name__)
CORS(app) 

@app.route('/api/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json()

    full_name = data.get('fullName')
    cpf = data.get('cpf')
    email = data.get('email')
    password_raw = data.get('password')
    birth_date = data.get('birthDate')
    gender = data.get('gender')
    phone = data.get('phone')

    if not full_name or not cpf or not email or not password_raw:
        return jsonify({"sucesso": False, "erro": "Dados obrigatórios faltando."}), 400

    # Criptografar senha
    password_hash = bcrypt.hashpw(password_raw.encode('utf-8'), bcrypt.gensalt())

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # --- MUDANÇA IMPORTANTE AQUI ---
        # No MySQL Connector, usamos %s em vez de ?
        sql = '''
            INSERT INTO users (full_name, cpf, email, password_hash, birth_date, gender, phone)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        '''
        val = (full_name, cpf, email, password_hash, birth_date, gender, phone)
        
        cursor.execute(sql, val)
        conn.commit()
        
        cursor.close()
        conn.close()

        return jsonify({"sucesso": True, "mensagem": "Usuário cadastrado com sucesso!"}), 201

    except mysql.connector.IntegrityError as err:
        # Erro 1062 é código para duplicidade no MySQL
        if err.errno == 1062:
            return jsonify({"sucesso": False, "erro": "CPF ou E-mail já cadastrados."}), 409
        return jsonify({"sucesso": False, "erro": str(err)}), 500
        
    except Exception as e:
        return jsonify({"sucesso": False, "erro": str(e)}), 500

if __name__ == '__main__':
    init_db() 
    app.run(debug=True, port=5000)
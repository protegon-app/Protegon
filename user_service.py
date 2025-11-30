# Protegon/user_service.py

import mysql.connector
from Protegon.db.init.db_connector import get_db_connection 
from werkzeug.security import generate_password_hash 


class UserService:
    """
    Gerencia as operações CRUD para a entidade 'Usuario',
    garantindo a segurança e integridade dos dados no banco.
    """
    
    def __init__(self):
        pass

    def _get_by_id(self, user_id, conn, cursor):
        """Método interno para buscar o usuário por ID."""
        
        # NOTE: A conexão (conn) e o cursor devem ser passados para evitar novas conexões.

        query = "SELECT id_usuario, nome_completo, cpf, data_nascimento, email, telefone, senha_hash, termos_aceitos, criado_em FROM usuario WHERE id_usuario = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if result:
            columns = ['id_usuario', 'nome_completo', 'cpf', 'data_nascimento', 'email', 'telefone', 'senha_hash', 'termos_aceitos', 'criado_em']
            return dict(zip(columns, result))
        return None

    def email_ou_cpf_existe(self, email, cpf):
        """Verifica se um e-mail ou CPF já existe na tabela usuario (para evitar duplicação)."""
        
        conn = None 
        
        try:
            conn = get_db_connection() 
            if not conn or not conn.is_connected():
                print("ERRO CRÍTICO: Falha ao estabelecer conexão com o banco de dados.")
                return True 
                
            cursor = conn.cursor()
            
            query = "SELECT COUNT(*) FROM usuario WHERE email = %s OR cpf = %s LIMIT 1"
            
            cursor.execute(query, (email, cpf)) 
            count = cursor.fetchone()[0] 
            
            return count > 0 
        
        except mysql.connector.Error as err:
            print(f"Erro ao executar a consulta SQL (existência): {err}")
            return True 
        finally:
            if conn:
                conn.close() 

    def create_user(self, dados):
        """Persiste um novo usuário no banco de dados e retorna o objeto sem a senha."""
        
        conn = None
        
        try:
            conn = get_db_connection()
            if not conn or not conn.is_connected():
                raise Exception("Falha ao conectar com o banco de dados.")

            cursor = conn.cursor()
            
            campos = ', '.join(dados.keys())
            placeholders = ', '.join(['%s'] * len(dados))
            query = f"INSERT INTO usuario ({campos}) VALUES ({placeholders})"
            valores = list(dados.values())
            
            cursor.execute(query, valores)
            conn.commit() 
            last_insert_id = cursor.lastrowid 
            
            usuario_criado = self._get_by_id(last_insert_id, conn, cursor)
            
            if usuario_criado:
                usuario_criado.pop('senha_hash', None)
                return usuario_criado
            
            return None 
            
        except mysql.connector.Error as err:
            if conn:
                conn.rollback() 
            print(f"Erro ao inserir usuário: {err}")
            raise err 
            
        finally:
            if conn:
                conn.close() 
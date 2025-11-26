# UserService.py

import mysql.connector
from Protegon.db.init.db_connector import DatabaseConnector

def email_ou_cpf_existe(self, email, cpf):
   
    query = "SELECT COUNT(*) FROM usuario WHERE email = %s OR cpf = %s"
   
   
# UserService.py
# ... (imports de mysql.connector e DatabaseConnector) ...

class UserService:

    def _get_by_id(self, user_id, conn, cursor):
        """Método interno para buscar o usuário por ID."""
        query = "SELECT id_usuario, nome_completo, cpf, data_nascimento, email, telefone, senha_hash, termos_aceitos, criado_em FROM usuario WHERE id_usuario = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if result:
            columns = ['id_usuario', 'nome_completo', 'cpf', 'data_nascimento', 'email', 'telefone', 'senha_hash', 'termos_aceitos', 'criado_em']
            return dict(zip(columns, result))
        return None


    def create_user(self, dados):
        conn = self.db_connector.connect()
        if not conn:
            
            raise Exception("Falha ao conectar com o banco de dados.")

        cursor = conn.cursor()
        
        
        campos = ', '.join(dados.keys())
        
        placeholders = ', '.join(['%s'] * len(dados))
        query = f"INSERT INTO usuario ({campos}) VALUES ({placeholders})"
        valores = list(dados.values())
        
        try:
           
            cursor.execute(query, valores)
            conn.commit()
            
            
            last_insert_id = cursor.lastrowid 
            
            
            usuario_criado = self._get_by_id(last_insert_id, conn, cursor)
            
            if usuario_criado:
                
                usuario_criado.pop('senha_hash', None)
                return usuario_criado
            
            return None
            
        except mysql.connector.Error as err:
            conn.rollback() 
            print(f"Erro ao inserir usuário: {err}")
            raise err 
            
        finally:
            cursor.close()
            conn.close()
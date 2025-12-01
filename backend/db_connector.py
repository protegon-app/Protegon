# database/connection.py

import os
from mysql.connector import connect, Error

#
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),  
    "database": os.getenv("DB_DATABASE"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}



def get_db_connection():
    """Tenta estabelecer e retornar a conexão com o banco de dados Protegon."""
    try:
        connection = connect(**DB_CONFIG)
        
        if connection.is_connected():
            print("--- Conexão MySQL estabelecida com sucesso! ---")
            
        return connection

    except Error as e:

        print(f"--- ERRO CRÍTICO NA CONEXÃO DO BANCO DE DADOS ---")
        print(f"Detalhe: Não foi possível conectar ao host '{DB_CONFIG['host']}' com o usuário '{DB_CONFIG['user']}'.")
        print(f"Erro: {e}")
        return None




def check_and_query():
    """Testa a conexão e executa uma query simples."""
    conn = get_db_connection()
    if conn is None:
        print("❌ Falha na conexão. Verifique se o container 'db' está rodando.")
        return

    try:
        cursor = conn.cursor()
        
       
        cursor.execute("SELECT COUNT(*) FROM usuario;")
        
        print("✅ Teste de query bem-sucedido! Tabela 'usuario' acessada.")
        
    except Error as e:
       
        print(f"⚠️ AVISO: Query falhou (Tabelas não encontradas ou erro SQL): {e}")
        
    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            print("Conexão fechada.")


if __name__ == "__main__":
    check_and_query()
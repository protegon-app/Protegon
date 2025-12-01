# Protegon/__init__.py

# Protegon/__init__.py

from flask import Flask
from Protegon.controllers.auth_controller import cadastrar_usuario 
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env (para o servidor)
load_dotenv() 

# ====================================================================
# 1. APPLICATION FACTORY (Cria o objeto 'app')
# ====================================================================

def CreateApp():
    """
    Função de fábrica que cria e configura a instância do aplicativo Flask.
    """
    app = Flask(__name__)
    
    # Configuração de Segurança e Debug
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key-insecure')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True') == 'True'

    # Registro da Rota (Roteamento Final Corrigido)
    # Rota: POST /usuarios/cadastrar
    app.add_url_rule('/usuarios/cadastrar', view_func=cadastrar_usuario, methods=['POST']) 
    
    return app


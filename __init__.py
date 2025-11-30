# Protegon/__init__.py
from flask import Flask

from Protegon.controllers.auth_controller import auth_bp

def create_app():
    app = Flask(__name__)
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    return app

app = create_app()
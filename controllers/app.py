
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from controllers.auth_controller import auth_bp


app = Flask(__name__)

app.register_blueprint(auth_bp, url_prefix='/api') 

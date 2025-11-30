# Protegon/__main__.py

import os
import sys
from Protegon import CreateApp

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')

if __name__ == '__main__':
    app = CreateApp()
    
    app.run(host='127.0.0.1', port=5000)
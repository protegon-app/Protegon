# Dockerfile para Python (Ex: Flask, Django)
FROM python:3.11-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o arquivo de requisitos e instala as dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código da aplicação
COPY . .

# Define a porta que a aplicação vai rodar
EXPOSE 8000 

# Comando para iniciar a aplicação (Ex: se for Flask ou Gunicorn)
CMD ["python", "app.py"] 
# OU CMD ["gunicorn", "--bind", "0.0.0.0:8000", "wsgi:app"]

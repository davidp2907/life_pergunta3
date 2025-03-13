FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Variável de ambiente
ENV GOOGLE_APPLICATION_CREDENTIALS="C:\Users\Usuario\OneDrive\Documentos\FORMULARIO_LIFENERGY\meu-backend\sua-chave.json"

# Mostra a porta que usará
EXPOSE 8080

# Comando para rodar a aplicação
CMD ["node", "server.js"]

FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev || npm install
COPY . .
EXPOSE 8002
CMD ["node", "server.js"]
FROM node:18-slim

WORKDIR /app
ENV PORT=10000
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 10000

CMD ["node", "server.js"]

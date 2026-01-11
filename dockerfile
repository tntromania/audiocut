# Folosim Node.js 18 Alpine pentru dimensiune redusă
FROM node:18-alpine

# Instalăm FFmpeg (necesar pentru procesarea audio)
RUN apk add --no-cache ffmpeg

# Setăm directorul de lucru
WORKDIR /app

# Copiem package.json
COPY package*.json ./

# Instalăm dependențele (folosim npm install în loc de npm ci)
RUN npm install --omit=dev

# Copiem restul aplicației
COPY . .

# Creăm directoarele necesare
RUN mkdir -p uploads processed

# Expunem portul
EXPOSE 3000

# Pornim aplicația
CMD ["node", "server.js"]
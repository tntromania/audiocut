# Folosim Node.js 18 Alpine pentru dimensiune redusă
FROM node:18-alpine

# Instalăm FFmpeg (necesar pentru procesarea audio)
RUN apk add --no-cache ffmpeg

# Setăm directorul de lucru
WORKDIR /app

# Copiem package.json și package-lock.json
COPY package*.json ./

# Instalăm dependențele
RUN npm ci --only=production

# Copiem restul aplicației
COPY . .

# Creăm directoarele necesare
RUN mkdir -p uploads processed

# Expunem portul
EXPOSE 3000

# Pornim aplicația
CMD ["node", "server.js"]

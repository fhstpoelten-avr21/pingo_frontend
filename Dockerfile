FROM node:16-alpine AS build

RUN apk update && \
    apk add --no-cache tzdata

WORKDIR /usr/src/app

# Installiere Abhängigkeiten
COPY package*.json ./
RUN npm install
RUN npm install -g @ionic/cli

# Kopiere den restlichen App-Code
COPY . .

# Baue die Ionic-App
#RUN npm run build

# Exponiere den Port, auf dem die App ausgeführt wird
EXPOSE 8100

# Starte die App
CMD ["ionic", "serve"]

# Stage 1: build
FROM node:20-alpine AS build

WORKDIR /app

# Copia TUTTO il progetto subito (serve per quasar prepare)
COPY . .

# Installa le dipendenze dopo aver copiato tutto
RUN npm install

# Build della app Quasar per produzione
RUN npm run build

# Stage 2: produzione (solo build finale)
FROM node:20-alpine AS production

WORKDIR /app

# Installa serve per servire i file statici
RUN npm install -g serve

# Copia solo la build dalla stage precedente
COPY --from=build /app/dist/spa ./dist/spa

# Espone la porta del server statico
EXPOSE 8080

# Comando per avviare il server statico
CMD ["serve", "-s", "dist/spa", "-l", "8080"]

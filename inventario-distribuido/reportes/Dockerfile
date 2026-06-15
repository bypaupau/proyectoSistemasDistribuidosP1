# Imagen base: Node 20 "slim" (ligera) sobre Debian.
FROM node:20-slim

# Carpeta de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos primero los package*.json y luego instalamos.
# Asi Docker cachea las dependencias y no reinstala en cada cambio de codigo.
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el resto del codigo (server.js, views/, public/).
COPY . .

# El servicio de reportes escucha en el puerto 4000.
EXPOSE 4000

# Comando que arranca el servicio al iniciar el contenedor.
CMD ["node", "server.js"]

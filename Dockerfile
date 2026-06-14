# Imagen base: Node 20 en versión "slim" (ligera) sobre Debian
FROM node:20-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero solo los package*.json y luego instalamos.
# Así Docker cachea la capa de dependencias y no reinstala
# cada vez que cambias el código.
COPY package*.json ./
RUN npm install --omit=dev

# Ahora sí copiamos el resto del código fuente
COPY . .

# Documentamos que la app usa el puerto 3000.
# (El puerto real se mapea al correr con -p; este EXPOSE es informativo.)
EXPOSE 3000

# Comando que arranca la app al iniciar el contenedor
CMD ["node", "src/index.js"]

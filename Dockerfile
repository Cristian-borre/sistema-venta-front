# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build


# Etapa 2: Producción
FROM nginx:stable-alpine AS production

# Elimina la configuración por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos compilados desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configuración personalizada de Nginx (opcional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

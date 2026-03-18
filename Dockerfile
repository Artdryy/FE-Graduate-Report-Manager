# Etapa de construccion
FROM node:22-alpine AS construccion
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compilar con URL relativa para que nginx haga proxy al backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Etapa de produccion con nginx
FROM nginx:alpine AS produccion

# Eliminar configuracion por defecto
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuracion personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos compilados
COPY --from=construccion /app/dist /usr/share/nginx/html

# Crear usuario sin privilegios (nginx ya corre como nginx user internamente)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

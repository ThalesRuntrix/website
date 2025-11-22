FROM nginx:alpine

# Copia todo o conteúdo da pasta 'pages' para o diretório do nginx
COPY pages /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
FROM nginx:1.30.4-alpine

COPY index.html styles.css app.js robots.txt sitemap.xml /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

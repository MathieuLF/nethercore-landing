FROM nginx:1.30.4-alpine

COPY public/index.html public/styles.css public/app.js public/robots.txt public/sitemap.xml /usr/share/nginx/html/
COPY public/assets/ /usr/share/nginx/html/assets/

EXPOSE 80

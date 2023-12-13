FROM node:21-alpine3.17 AS build-stage
WORKDIR /app
COPY package*.json /app
RUN npm install
COPY . .
RUN npm run build


FROM nginx:1.25.3
WORKDIR /var/www
RUN mkdir -p /var/www/lk.druzba-test.site
COPY --from=build-stage /app/dist/ /var/www/lk.druzba-test.site
COPY --from=build /app/.nginx/nginx.conf /etc/nginx/sites-enabled/lk.druzba-test.site
RUN nginx -T

VOLUME /var/log/nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


# build stage
FROM node:21-alpine3.17 AS build-stage

WORKDIR /builddir

COPY package*.json /builddir

RUN npm install

COPY . .

RUN npm run build

# CMD ["npm", "run", "dev"]

FROM nginx:1.25.3 AS production-stage

# WORKDIR /var/www

COPY --from=build-stage /builddir/dist/ /var/www

RUN nginx -T

VOLUME /var/log/nginx
EXPOSE 80

# WORKDIR /var/www

# COPY --from=build-stage /builddir/dist /var/www

# COPY --from=build-stage nginx.conf /etc/nginx/sites-availabe/lk.druzba-test.site

# RUN nginx -T

# # VOLUME /var/log/nginx
# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]


# FROM node:latest as build-stage
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY ./ .
# RUN npm run build

# FROM nginx:1.25.3 as production-stage
# RUN mkdir /app
# COPY --from=build-stage /app/dist /app
# COPY ./nginx.conf /etc/nginx/nginx.conf

# RUN nginx -t

# FROM node:21-alpine3.17 AS build-stage
# WORKDIR /app
# COPY package*.json /app
# RUN npm install
# COPY . .
# RUN npm run build


# FROM nginx:1.25.3
# # WORKDIR /var/www
# # RUN mkdir -p /var/www/lk.druzba-test.site
# COPY --from=build-stage /app/dist/ /var/www/lk.druzba-test.site
# COPY --from=build-stage /app/nginx.conf /etc/nginx/sites-enabled/lk.druzba-test.site

# COPY ./nginx.conf /etc/nginx/nginx.conf
# RUN nginx -t

# VOLUME /var/log/nginx
# # EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]




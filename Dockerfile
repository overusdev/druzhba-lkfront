# build stage
FROM node:21-alpine3.17 AS build-stage

WORKDIR /app

# ENV PATH /var/www/html/lk.druzhba-nn.site/node_modules/.bin:$PATH

COPY package*.json /app

RUN npm install

COPY ./ .

RUN npm run build

# CMD ["npm", "run", "dev"]


FROM nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY --from=build-stage nginx.conf /etc/nginx/nginx.conf

# COPY --from=build-stage nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


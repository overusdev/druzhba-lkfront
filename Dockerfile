# build stage
FROM node:21-alpine3.17

WORKDIR /var/www/html/lk.druzhba-nn.site

ENV PATH /var/www/html/lk.druzhba-nn.site/node_modules/.bin:$PATH

COPY package.json /var/www/html/lk.druzhba-nn.site/package.json

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
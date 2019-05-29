FROM node:10.4.0-alpine

RUN mkdir /app/
WORKDIR /app/

COPY . /app/
RUN apk update && apk add --no-cache bash git openssh python python-dev make build-base
RUN npm install

CMD node /app/index.js
EXPOSE 8223
EXPOSE 8222


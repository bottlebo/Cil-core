FROM node:10.4.0-alpine

RUN mkdir /app/
WORKDIR /app/

COPY . /app/
RUN npm install

CMD node /app/index.js
EXPOSE 18222
EXPOSE 18223
EXPOSE 8223
EXPOSE 8222


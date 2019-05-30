FROM nikolaik/python-nodejs:python2.7-nodejs10

RUN mkdir /app/
WORKDIR /app/

COPY . /app/
RUN npm install

CMD node /app/index.js --rpcAddress 0.0.0.0
EXPOSE 8222
EXPOSE 8223

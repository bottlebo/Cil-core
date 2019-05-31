FROM nikolaik/python-nodejs:python2.7-nodejs10

RUN mkdir /app/
WORKDIR /app/

COPY . /app/
RUN npm install

ENV SQL_CONFIG_PATH=config/docker_prod_sql.conf.json

CMD node /app/index.js --rpcAddress 0.0.0.0 --txIndex
EXPOSE 8222
EXPOSE 8223

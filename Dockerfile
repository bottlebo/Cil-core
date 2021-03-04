FROM nikolaik/python-nodejs:python2.7-nodejs10

STOPSIGNAL SIGTERM

RUN mkdir /app/
WORKDIR /app/

COPY . /app/
RUN npm install

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait

#CMD /wait && sleep 10s && node /app/index.js --rpcAddress 0.0.0.0 --txIndex --apiConfig docker-prod --apiUser username --apiPassword password
CMD /wait && sleep 10s && node /app/index.js --txIndex --workerConfig docker-prod

EXPOSE 8222
EXPOSE 8223

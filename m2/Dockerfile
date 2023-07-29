FROM node:18-alpine as build
RUN addgroup app && adduser -S -G app app
USER app
WORKDIR /app
RUN mkdir data
COPY ./m2/package.json ./
COPY ./m2/package-lock.json ./
RUN npm ci --silent
COPY ./m2 .
CMD [ "node", "worker.js" ]
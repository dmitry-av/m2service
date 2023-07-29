FROM node:18-alpine as build
RUN addgroup app && adduser -S -G app app
USER app
WORKDIR /app
RUN mkdir data
COPY ./m1/package.json ./
COPY ./m1/package-lock.json ./
RUN npm ci --silent
COPY ./m1 .
CMD [ "node", "app.js" ]
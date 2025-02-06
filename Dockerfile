FROM node:alpine3.20

WORKDIR /app .

COPY package.*json .
COPY . .

RUN  npm install
RUN  npm run build
EXPOSE 8085
CMD [ "npm", "run", "start:prod" ]
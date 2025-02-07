FROM node:alpine3.20

WORKDIR /app .

COPY package.*json .
RUN  npm install
COPY . .
RUN  npm run build

EXPOSE 8085
CMD [ "npm", "run", "start:prod" ]
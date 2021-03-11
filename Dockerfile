FROM node:15

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install
COPY . .

EXPOSE 8005 
CMD [ "yarn", "start" ]
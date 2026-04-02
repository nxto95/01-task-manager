FROM node
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm i --force
COPY . .
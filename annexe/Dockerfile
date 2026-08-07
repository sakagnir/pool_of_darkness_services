FROM node:alpine
WORKDIR /annexe
COPY package*.json ./
RUN npm ci
COPY . /annexe/
EXPOSE 8000
CMD [ "node", "server.js" ]

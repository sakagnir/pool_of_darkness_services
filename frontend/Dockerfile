FROM node:alpine
WORKDIR /frontend
COPY package*.json ./
RUN npm ci
COPY . /frontend/
EXPOSE 8080
CMD [ "node", "server.js" ]
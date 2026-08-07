FROM node:alpine
WORKDIR /backend
COPY package*.json ./
RUN npm ci
COPY . /backend/
CMD [ "node", "index.js" ]
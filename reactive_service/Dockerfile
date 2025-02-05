FROM node:lts-alpine3.19
RUN apk add --no-cache curl
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build
EXPOSE 8080 8081
CMD ["npm", "start"]

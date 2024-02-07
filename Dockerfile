FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine AS server
WORKDIR /app
COPY package* ./
RUN npm install --production
COPY --from=builder ./app/build ./build
COPY runFirstTime.sh ./
ENTRYPOINT ["./runFirstTime.sh"]

EXPOSE 3000

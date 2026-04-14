FROM node:22-alpine AS build-stage

WORKDIR /app

COPY package*.json ./
COPY .npmrc ./

RUN npm install --legacy-peer-deps --ignore-scripts

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/default.conf

RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:14 as base

WORKDIR /app
COPY . .
RUN npm i
RUN npm run build


FROM node:14 as production
WORKDIR /app
COPY --from=base /app/dist /app/dist
COPY --from=base /app/package*.json /app/
COPY --from=base /app/bin /app/bin
ENV NODE_ENV=production
RUN npm i --only=prod && apt-get update -y && apt-get install vim -y
EXPOSE 3000
CMD node bin/www

FROM node:18-alpine3.18 AS dependencies
RUN npm install -g pnpm
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node . .
RUN pnpm i

FROM dependencies AS build
WORKDIR /home/node/app
RUN pnpm run api:build

FROM node:18-alpine3.18
RUN npm install -g pnpm
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node --from=build /home/node/app .
CMD ["pnpm", "run", "api:prod"]

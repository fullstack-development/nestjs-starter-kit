FROM node:14-alpine as deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY yarn.lock package.json ./
COPY eslint-plugin/yarn.lock ./eslint-plugin/
COPY eslint-plugin/package.json ./eslint-plugin/
RUN ls
RUN cd eslint-plugin && yarn install --frozen-lockfile --silent && cd ../
RUN yarn install --frozen-lockfile --silent

FROM node:14-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:14-alpine as runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

ENV DB_ADDRESS=$DB_ADDRESS
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME 
ENV DB_PORT=$DB_PORT
ENV JWT_SECRET=$JWT_SECRET
ENV JWT_EXPIRES_IN=$JWT_EXPIRES_IN 
ENV PORT_API=$PORT_API 
ENV JWT_REFRESH_TOKEN_SECRET=$JWT_REFRESH_TOKEN_SECRET 
ENV JWT_REFRESH_TOKEN_EXPIRATION_TIME=$JWT_REFRESH_TOKEN_EXPIRATION_TIME

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "DB_ADDRESS=$DB_ADDRESS DB_USER=$DB_USER DB_PASSWORD=$DB_PASSWORD DB_NAME=$DB_NAME DB_PORT=$DB_PORT JWT_SECRET=$JWT_SECRET JWT_EXPIRES_IN=$JWT_EXPIRES_IN PORT_API=$PORT_API JWT_REFRESH_TOKEN_SECRET=$JWT_REFRESH_TOKEN_SECRET JWT_REFRESH_TOKEN_EXPIRATION_TIME=$JWT_REFRESH_TOKEN_EXPIRATION_TIME NODE_ENV=production node dist/main"]

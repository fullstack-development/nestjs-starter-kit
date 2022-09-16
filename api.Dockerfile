FROM node:16.17-alpine3.15

COPY . /stk
WORKDIR /stk

RUN npm install yarn -g
RUN yarn && yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]

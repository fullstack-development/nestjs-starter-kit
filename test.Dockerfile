FROM node:16.17-alpine3.15

COPY . /stk
WORKDIR /stk/api-tests

RUN npm install yarn -g
RUN yarn

CMD ["yarn", "test:api"]

FROM node:16.17-alpine3.15

COPY . /stk
WORKDIR /stk

ENV ADDRESS_API=$ADDRESS_API
ENV PORT_API=$PORT_API
ENV MAX_TRIES=$MAX_TRIES

RUN chmod +x /stk/run.sh
RUN apk --no-cache add curl
RUN apk --no-cache add bash
RUN yarn

CMD [ "sh", "-c", "ADDRESS_API=$ADDRESS_API PORT_API=$PORT_API MAX_TRIES=$MAX_TRIES /stk/run.sh" ]

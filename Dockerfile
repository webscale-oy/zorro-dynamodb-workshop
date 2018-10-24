FROM node:10.11-alpine

# Install AWS CLI
RUN \
  mkdir -p /aws && \
  apk -Uuv add groff less python py-pip git && \
  pip install awscli && \
  apk --purge -v del py-pip && \
  rm /var/cache/apk/*

RUN apk add --no-cache make gcc g++ python
RUN mkdir -p /app/dist
WORKDIR /app

COPY package.json /app/
COPY tsconfig.json /app/
COPY src /app/src

RUN npm install
RUN npm run build-ts

EXPOSE 9000
CMD npm run start
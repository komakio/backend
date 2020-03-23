##############
## BUILDER
##############
FROM node:12 AS builder

# Create app directory
WORKDIR /usr

# Cache app dependencies
COPY package.json /usr/
COPY package-lock.json /usr/
RUN npm install

# Copy configs
COPY tsconfig.json /usr
COPY tsconfig.build.json /usr
COPY nest-cli.json /usr

# Bundle app source
COPY apps /usr/apps
COPY libs /usr/libs
COPY utils /usr/utils
RUN npm run build

##############
## RUNNER
##############
FROM node:12-alpine

# Create app directory
RUN mkdir -p /usr
WORKDIR /usr

COPY package*.json ./
RUN apk add --no-cache --virtual .gyp \
        python \
        make \
        g++ \
    && npm install --production \
    && apk del .gyp

COPY --from=builder /usr/dist ./dist


ENV NODE_ENV production

CMD npm run start:prod

EXPOSE 3030

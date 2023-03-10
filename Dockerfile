FROM node:14.17.0

#
# Step #1: Setup system workdir
#
#ENV HOME /werfans-api
RUN mkdir /app
WORKDIR /app
COPY package*.json ./
RUN npm i 
COPY . .
ADD . /app

#
# Step #2: Configure .env
#
ARG NODE_ENV=develop
# This is used to decrypt the `.env.${NODE_ENV}`.
# NOTE: Must change this on our devops side (e.g. gitlab kubernetes variables)
ARG ENV_PASSWORD=develop
# decrypt env
RUN NODE_ENV=${NODE_ENV} ENV_PASSWORD=${ENV_PASSWORD} && yarn install

#
# Step #3: build
#
RUN ENV_PASSWORD=${ENV_PASSWORD} yarn build:${NODE_ENV}


EXPOSE 8080

ENV NODE_ENV=${NODE_ENV}
CMD yarn start:${NODE_ENV}
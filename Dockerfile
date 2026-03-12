# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force


FROM base AS build

ENV NODE_ENV="development"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential pkg-config python-is-python3

# Copy all package.json files for workspace resolution
COPY package.json yarn.lock package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

RUN yarn install --frozen-lockfile

COPY . .

ENV PATH="/app/node_modules/.bin:$PATH"

RUN yarn run build

# Remove devDependencies
ENV NODE_ENV="production"
RUN yarn install --frozen-lockfile --production=true


FROM base

ENV NODE_ENV="production"

COPY --from=build /app /app

EXPOSE 8080
CMD [ "yarn", "run", "start" ]

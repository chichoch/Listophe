# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV="production"
ARG YARN_VERSION=1.22.21
RUN npm install -g yarn@$YARN_VERSION --force


FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy all package.json files for workspace resolution
COPY package.json yarn.lock package-lock.json ./
COPY frontend/package.json frontend/
COPY backend/package.json backend/

RUN yarn install --frozen-lockfile --production=false

COPY . .

# Add node_modules/.bin to PATH so tsc/vite are found
ENV PATH="/app/node_modules/.bin:$PATH"

RUN yarn run build

RUN yarn install --production=true


FROM base

COPY --from=build /app /app

EXPOSE 3000
CMD [ "yarn", "run", "start" ]

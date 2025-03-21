FROM node:18-alpine
RUN corepack enable && corepack prepare yarn@4.5.1 --activate
WORKDIR /deps
COPY app/package.json app/yarn.lock ./
RUN yarn config set nodeLinker node-modules
RUN yarn install --frozen-lockfile
WORKDIR /app
RUN ln -s /deps/node_modules /app/node_modules
EXPOSE 3000
CMD ["yarn", "dev"]
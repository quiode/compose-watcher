FROM "node:18-alpine"

# Config
VOLUME [ "/repository" ]
# Read only (:ro)
VOLUME [ "/var/run/docker.sock" ]
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV LOG=info
ENV GIT_DIR=/repository
EXPOSE 80

# install dependencies
RUN apk --no-cache add git docker
RUN npm i -g pnpm

# workdir & user
WORKDIR /app
RUN mkdir /repository && addgroup watcher && adduser watcher -H -D -G watcher && chown -R watcher:watcher /app && chown -R watcher:watcher /repository
USER watcher

# npm packages
COPY package.json pnpm-lock.yaml ./
RUN pnpm i -P

# final steps
COPY tsconfig.json ./
COPY src src

CMD pnpm start

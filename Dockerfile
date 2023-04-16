FROM "node:18-alpine"

# Config
VOLUME [ "/app/repository" ]
# Read only (:ro)
VOLUME [ "/var/run/docker.sock" ]
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV LOG=info
ENV GIT_DIR=/app/repository
EXPOSE 80

# install dependencies
RUN apk update && apk --no-cache add git docker openssh
RUN npm i -g pnpm

# workdir & user
WORKDIR /app
RUN addgroup watcher && adduser watcher -D -G watcher && chown -R watcher:watcher /app && mkdir repository
USER watcher

# npm packages
COPY package.json pnpm-lock.yaml ./
RUN pnpm i

# final steps
COPY tsconfig.json ./
COPY src src

CMD pnpm start

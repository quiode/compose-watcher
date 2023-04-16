FROM "node:18" as build

# pnpm
RUN npm i -g pnpm

# workdir
WORKDIR /build

# build
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src src
RUN pnpm i && pnpm build

FROM "node:18"

# Config
VOLUME [ "/app/repository" ]
VOLUME [ "/root/.ssh" ]
# Read only (:ro)
VOLUME [ "/var/run/docker.sock" ]
ENV PORT=80
ENV HOSTNAME=0.0.0.0
ENV LOG=info
ENV GIT_DIR=/app/repository
EXPOSE 80

# install dependencies
RUN apt update && apt install -y docker docker-compose
RUN npm i -g pnpm

# workdir
WORKDIR /app

# npm packages
COPY package.json pnpm-lock.yaml ./
RUN pnpm i -P

# copy dist
COPY --from=build /build/dist dist

CMD pnpm start

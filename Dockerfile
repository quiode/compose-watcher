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
ENV REPO_DIR=/app/repository
EXPOSE 80

# ignore double ownership
RUN git config --global safe.directory '*'

# install docker
RUN apt update
RUN apt remove -y docker docker.io containerd runc
RUN apt install -y ca-certificates \
  curl \
  gnupg
RUN install -m 0755 -d /etc/apt/keyrings
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
RUN chmod a+r /etc/apt/keyrings/docker.gpg
RUN echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
RUN apt update
RUN apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# install pnpm
RUN npm i -g pnpm

# workdir
WORKDIR /app

# npm packages
COPY package.json pnpm-lock.yaml ./
RUN pnpm i -P

# copy dist
COPY --from=build /build/dist dist

CMD pnpm start

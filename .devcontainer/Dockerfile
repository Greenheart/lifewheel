FROM mcr.microsoft.com/devcontainers/typescript-node:24-trixie

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt upgrade -y

# Only run scripts that we explicitly allow
RUN npm config set ignore-scripts true
RUN npm i -g npm@latest

# Install pnpm. This should match the version in package.json
RUN npm install -g pnpm@10.28.2

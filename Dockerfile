FROM node:14

WORKDIR /app

# Install opencv4nodejs.
ARG OPENCV4NODEJS_PACKAGE_JSON
COPY $OPENCV4NODEJS_PACKAGE_JSON ./package.json
RUN \
    # Install build dependencies of opencv4nodejs.
    apt-get update && \
    apt-get install -y build-essential && \
    apt-get install -y --no-install-recommends wget git cmake ca-certificates && \
    # Install opencv4nodejs.
    npm install

# Install the app.
COPY . .
RUN \
    # Cleanup build dependencies.
    rm -rf /var/lib/apt/lists/* && \
    apt-get purge -y build-essential wget git cmake && \
    apt-get autoremove -y --purge && \
    # Install the app.
    npm install

EXPOSE 80
ENTRYPOINT ["npm", "run"]

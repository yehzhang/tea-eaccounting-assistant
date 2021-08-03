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

# Install remote_syslog2 and the app.
COPY . .
RUN \
    # Install remote_syslog2.
    wget -q -O - "https://github.com/papertrail/remote_syslog2/releases/download/v0.19/remote_syslog_linux_amd64.tar.gz" | tar -zxf - && \
    # Cleanup build dependencies
    rm -rf /var/lib/apt/lists/* && \
    apt-get purge -y build-essential wget git cmake && \
    apt-get autoremove -y --purge && \
    # Install the app.
    npm install

# Start remote_syslog2 and app.
ARG LOG_HOSTNAME
ARG NPM_RUN_SCRIPT
EXPOSE 80
CMD ["sh", "-c", \
    "touch ./tea_dispenser.log && \
    ./remote_syslog/remote_syslog -p 47272 -d logs3.papertrailapp.com --pid-file=/var/run/remote_syslog.pid --tls --hostname=$LOG_HOSTNAME ./tea_dispenser.log && \
    npm run $NPM_RUN_SCRIPT"]

#!/bin/bash

mkdir -p build
touch build/opencv4nodejs_package.json
yarn --silent jqn --color=false 'pick("dependencies.opencv4nodejs")' < package.json > build/opencv4nodejs_package.json

docker build --build-arg OPENCV4NODEJS_PACKAGE_JSON=build/opencv4nodejs_package.json .

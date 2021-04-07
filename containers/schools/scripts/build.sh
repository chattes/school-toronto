#!/bin/bash

set -e

TAG=${1:-"latest"}

echo "Building redis-look"
docker build -t 127.0.0.1:5000/redis-look:$TAG redis-look

echo "Building redis-sentinel"
docker build -t 127.0.0.1:5000/redis-sentinel:$TAG redis-sentinel

echo "Building redis-utils"
docker build -t 127.0.0.1:5000/redis-utils:$TAG redis-utils

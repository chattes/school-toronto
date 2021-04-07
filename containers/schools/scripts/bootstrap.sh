#!/bin/bash

set -e

export TAG=${1:-"latest"}

NUM_OF_SENTINELS=3
NUM_OF_REDIS=3
REDIS_SENTINEL_NAME="redis-sentinel"
REDIS_MASTER_NAME="redismaster"

echo "Starting redis-zero"
docker service create --network redis --name redis-zero redis:4.0.11-alpine

echo "1- Start to push on registry the redis docker image which can be used as master or slave in the stack..."
docker-compose -f redis-look/compose.yml build
docker-compose -f redis-look/compose.yml push
echo "(1)End to build and push redis image to registry."
echo "-------------------------------------------------------\n"

echo "2- Start to push on registry the redis docker image which will be used to build sentinel..."
docker-compose -f redis-sentinel/compose.yml build
docker-compose -f redis-sentinel/compose.yml push
echo "(2)End to build and push redis sentinel image to registry."
echo "-------------------------------------------------------\n"

echo "2- Start to push on registry the redis utils image which will be used to build sentinel..."
docker-compose -f redis-utils/compose.yml build
docker-compose -f redis-utils/compose.yml push
echo "(2)End to build and push redis sentinel image to registry."
echo "-------------------------------------------------------\n"

echo "2- Start to push on registry the node app image"
docker-compose -f school-query-service/docker-compose.prod.yml build
docker-compose -f school-query-service/docker-compose.prod.yml push
echo "(2)End to build and push node app"
echo "-------------------------------------------------------\n"



echo "Starting services"
docker stack deploy -c scripts/stack.yml cache

until [ "$(docker run --rm --network redis 127.0.0.1:5000/redis-utils:$TAG \
	$REDIS_SENTINEL_NAME $REDIS_MASTER_NAME \
	value num-other-sentinels)" = "$((NUM_OF_SENTINELS - 1))" ]; do
	echo "Sentinels not set up yet - sleeping"
	sleep 2
done

until [ "$(docker run --rm --network redis 127.0.0.1:5000/redis-utils:$TAG \
	$REDIS_SENTINEL_NAME $REDIS_MASTER_NAME \
	value "num-slaves")" = "$NUM_OF_REDIS" ]; do
	echo "Slaves not set up yet - sleeping"
	sleep 2
done

old_master=$(docker run --rm --network redis 127.0.0.1:5000/redis-utils:$TAG \
	$REDIS_SENTINEL_NAME $REDIS_MASTER_NAME value ip)
echo "redis-zero ip is ${old_master}"

echo "Removing redis-zero"
docker service rm redis-zero

until [ "$(docker run --rm --network redis 127.0.0.1:5000/redis-utils:$TAG \
	$REDIS_SENTINEL_NAME $REDIS_MASTER_NAME value ip)" != "$old_master" ]; do
	echo "Failover did not happen yet - sleeping"
	sleep 2
done

echo "Make sure the number of slaves are set"
docker run --rm --network redis 127.0.0.1:5000/redis-utils:$TAG \
	$REDIS_SENTINEL_NAME $REDIS_MASTER_NAME reset "num-slaves" "$((NUM_OF_REDIS - 1))"

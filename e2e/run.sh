#!/bin/bash

if [[ -z "$MAX_TRIES" ]]; then
    echo "MAX_TRIES env variable not found"
    exit 1
fi

declare -i i=0

while [[ "$http_response" != "200" ]] && [[ "$timeout" != "true" ]]; do
    ((i++))
    echo "Try connect to API: $i"

    http_response=$(curl --connect-timeout 1 --max-time 1 --write-out '%{http_code}' --silent --output /dev/null http://api:${API_PORT}/api/echo)

    if [[ "$i" = "$MAX_TRIES" ]]; then
        timeout=true
    fi

    sleep 1
done

if [[ "$timeout" = true ]]; then
    echo "API timeout"
    exit 2
fi

yarn test --runInBand

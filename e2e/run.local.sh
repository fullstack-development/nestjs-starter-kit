#!/bin/bash

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

for arg in "$@"
do
    if [[ "$arg" =~ ^.*\.spec\.ts$ ]]; then
        printf "\n\e[36mTesting file:\e[0m $arg\n"
        if [[ "$test_file" == "" ]]; then
            test_file="(/$arg"
        else
            test_file="$test_file|/$arg"
        fi
    fi
done
printf "\n"

if [[ "$test_file" != "" ]]; then
    test_file="$test_file)"
fi

while [ $# -gt 0 ]; do
    if [[ $1 == "--"* ]]; then
        v="${1/--/}"
        declare "$v"="$2"
        shift
    fi
    shift
done

node run.local.prepare.js

if [[ $? != 0 ]]; then
    exit $?
fi

source ./.env

API_ADDRESS=localhost \
API_PORT=3000 \
yarn test --runInBand $([[ "$test_file" != "" ]] && printf -- "--testRegex=$test_file")

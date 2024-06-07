# Starter kit Node js

## Links

1. [API doc](./api/Readme.md)

## Preparations

### Installation

Do installations step by step:

1.  Install dependencies for `api`

    ```bash
    cd ./api
    yarn
    ```

    The postinstall script will generate prisma types for you

    `On windows can be not work auto generating prisma schema. You can manual copy schema.prisma in api/src/schema.prisma`

2.  Then install dependencies for `e2e`

    ```bash
    cd ./e2e
    yarn
    ```

    The postinstall script will generate prisma types for you

    `On windows can be not work auto generating prisma schema. You can manual copy schema.prisma in e2e/src/schema.prisma`

### Launch

#### Local with docker

1. Run docker containers via docker-compose from the root folder of the repository

    ```bash
    docker compose -f stk.docker-compose.yaml up -d --build
    ```

2. Go to `api/env` folder and create copy of `dev.example.env` to `dev.env`
    ```bash
    cd ./api/env
    cp ./dev.example.env ./dev.env
    ```
3. Copy `schema.prisma` from root dir in `api/src/schema.prisma`
4. Go up to `api` and launch migrations
    ```bash
    cd ../
    source ./env/dev.env && DATABASE_URL=$DATABASE_URL yarn prisma:migrate:deploy
    ```
    - Press `Yes (y)` if it asks you to install missed dependencies

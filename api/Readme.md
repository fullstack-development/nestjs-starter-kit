# FantasyPad api

## 1. Install deps
```bash
yarn
```

## 2. Run local

create env/dev.env file with all envs

```bash
yarn start:dev
```

## 3. Env review

| Env name      | Description |
| ----------- | ----------- |
| DB_ADDRESS  | PG db address       |
| DB_USER     | User for created db       |
| DB_PASSWORD | Password for created db |
| DB_NAME     | Db name |
| JWT_SECRET | secret for checking JWT |
| JWT_EXPIRES_IN | expires date for JWT (example: '1 days') |
| JWT_REFRESH_TOKEN_SECRET | secret for checking JWT token for refresh |
| JWT_REFRESH_TOKEN_EXPIRATION_TIME | expires date for JWT (example: '1 days') |
| ENVIRONMENT | available values: stage, local, prod |

> See env/dev.env.example for examples


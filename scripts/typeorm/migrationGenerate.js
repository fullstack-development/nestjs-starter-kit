const { execSync } = require('node:child_process');

const name = process.argv[2];
execSync(
    `npx typeorm migration:generate -d ./typeorm.datasource.js --outputJs ./libs/repository/src/migrations/${name}`,
    {
        stdio: 'inherit',
        encoding: 'utf-8',
    },
);

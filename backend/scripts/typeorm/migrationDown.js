const { execSync } = require('node:child_process');

execSync(`pnpm run build && npx typeorm migration:revert -d ./typeorm.datasource.js`, {
    stdio: 'inherit',
    encoding: 'utf-8',
});

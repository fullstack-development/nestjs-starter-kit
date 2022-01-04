module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'deprecation', 'nestjs-kit'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    rules: {
        'nestjs-kit/provide-endpoint-return-type': 'error',
        'max-len': [
            'error',
            110,
            {
                ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
                ignoreUrls: true,
            },
        ],
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/array-type': [
            'error',
            {
                default: 'generic',
            },
        ],
        '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-for-in-array': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        'deprecation/deprecation': 'warn',
        'no-console': 'error',
        'no-empty': 'error',
        'no-shadow': [
            'off',
            {
                hoist: 'all',
            },
        ],
    },
};

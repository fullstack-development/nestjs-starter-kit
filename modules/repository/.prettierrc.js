module.exports = {
    bracketSpacing: true,
    jsxBracketSameLine: false,
    printWidth: 100,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
    endOfLine: 'lf',
    overrides: [
        {
            files: '*.json',
            options: {
                singleQuote: false,
                trailingComma: 'none',
            },
        },
    ],
};

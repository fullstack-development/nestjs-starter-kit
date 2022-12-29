module.exports = function (options, webpack) {
    return {
        ...options,
        devtool: 'source-map',
        module: {
            ...options.module,
            rules: [
                ...options.module.rules,
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            projectReferences: true,
                        },
                    },
                },
            ],
        },
    };
};

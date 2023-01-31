const path = require('path');
const fs = require('fs');
const { HotModuleReplacementPlugin, DefinePlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { getText } = require('./descriptions');

module.exports = {
    entry: path.resolve(__dirname, './src/index.tsx'),
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(jpg|png|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[hash].[ext]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
        modules: ['node_modules'],
    },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        publicPath: '/',
        filename: 'index.js',
    },
    devServer: {
        port: 7000,
    },
    plugins: [
        new HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'index.html'),
        }),
        new DefinePlugin({
            'process.env': {
                DOC_DESCRIPTIONS_STRING: JSON.stringify(getText()),
                DOC_GENERATED_STRING: fs
                    .readFileSync(path.resolve(__dirname, '../generated.json'))
                    .toString(),
            },
        }),
    ],
};

const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { DefinePlugin } = require('webpack');

const DEV = (process.env.NODE_ENV?.toLowerCase() !== 'production');
const ENV = DEV ? 'development' : 'production';

console.log(`*** ${ENV.toUpperCase()} ***\n`);

module.exports = {
    stats: 'minimal',
    mode: DEV ? 'development' : 'production',
    devtool: DEV ? 'eval-cheap-source-map' : undefined,
    entry: resolve(__dirname, 'src/index.ts'),
    output: {
        filename: 'bundle.js',
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js', '.css'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        // static: resolve(__dirname, 'public'),
        hot: true,
        devMiddleware: {
            publicPath: '/',
        }
    },
    plugins: [
        new HtmlWebpackPlugin({ inject: true }),
        new DefinePlugin({ _ENV: JSON.stringify(ENV), }),
    ],
};
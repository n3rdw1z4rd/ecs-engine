const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('path');

module.exports = {
    stats: 'minimal',
    mode: 'development',
    devtool: 'eval-cheap-source-map',
    entry: resolve(__dirname, 'test/index.ts'),
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
            {
                test: /\.(glsl|vert|frag)$/,
                use: ['ts-shader-loader'],
            },
        ],
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        hot: true,
    },
    plugins: [
        new HtmlWebpackPlugin({ inject: true }),
    ],
};
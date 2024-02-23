const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { entry, main } = require('./package.json');

const DEV = (process.env.NODE_ENV?.toLowerCase() !== 'production');
const ENV = DEV ? 'development' : 'production';
const [OUTPUT_PATH, OUTPUT_FILENAME] = main.split('/');

console.log(`*** ${ENV.toUpperCase()} BUILD ***\n`);
console.log('output:', main, '\n');

module.exports = {
    stats: 'minimal',
    mode: DEV ? 'development' : 'production',
    devtool: DEV ? 'eval-cheap-source-map' : undefined,
    entry: resolve(__dirname, DEV ? entry.development : entry.production),
    output: {
        filename: DEV ? 'test.bundle.js' : OUTPUT_FILENAME,
        path: resolve(__dirname, OUTPUT_PATH),
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
            {
                test: /\.(glsl|vert|frag)$/,
                use: ['ts-shader-loader'],
            },
        ],
    },
    devServer: {
        host: '0.0.0.0',
        port: 3000,
        static: resolve(__dirname, 'public'),
        hot: true,
        devMiddleware: {
            publicPath: '/',
        }
    },
    plugins: DEV ? [
        new HtmlWebpackPlugin({ inject: true }),
    ] : [],
};
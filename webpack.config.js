var path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        examples: [
            path.join(__dirname, 'examples.js')
        ]
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        sourceMapFilename: '[file].map',
        publicPath: '/build/',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader',
                ],
            }
        ]
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: __dirname,
        },
    }
}

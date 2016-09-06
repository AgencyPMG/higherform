var path = require('path');

module.exports = {
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
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
    devtool: 'source-map'
}

var path = require('path');
var buildPath = path.resolve(__dirname, './dist');

module.exports = {
    entry: "./src/index.ts",
    output: {
        path: buildPath,
        filename: 'huject.js',
        library: 'huject',
        libraryTarget: 'umd'
    },

    resolve: {
        extensions: ['', '.ts', '.webpack.js', '.web.js', '.js']
    },

    // Source maps support (or 'inline-source-map' also works)
    devtool: 'source-map',

    // Add loader for .ts files.
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader?emitRequireType=false'
            }
        ]
    },
    // Disable some unnecessary browser shims for node
    node: {
        global: false,
        process: false,
        Buffer: false,
        setImmediate: false
    }
};
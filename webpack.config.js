const path = require( 'path' );

module.exports = {
    entry: './app/index.jsx',
    module: {
        rules: [
            {
                exclude: /(node_modules|bower_components)/,
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'env',
                            'react',
                        ],
                    },
                },
            },
        ],
    },
    devtool: 'source-map',
    output: {
        filename: 'app.js',
        path: path.resolve( __dirname, 'web/scripts' ),
    },
    resolve: {
        extensions: [
            '.js',
            '.jsx',
        ],
    },
};

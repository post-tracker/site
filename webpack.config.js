const path = require( 'path' );

const defaultRewrite = function ( path, req ) {
    return '/index.html';
};

const assetsRewrite = function ( path, req ) {
    if ( path.match( '/assets/theme-light.css' ) || path.match( '/assets/theme-dark.css' ) ) {
        return path.replace( '/assets', '' );
    }

    const matches = path.match( /\/.+?(\/.*)/ );

    return matches[ 1 ];
};

module.exports = {
    entry: './app/index.jsx',
    mode: 'development',
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
    devServer: {
        contentBase: path.join( __dirname, 'dev' ),
        compress: true,
        https: true,
        host: '0.0.0.0',
        port: 9000,
        publicPath: "https://0.0.0.0:9000/scripts/",
        watchContentBase: true,
        proxy: {
            '/*/*.html': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: defaultRewrite,
            },
            '/*/': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: defaultRewrite,
            },
            '/*/assets/**': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: assetsRewrite,
            },
            '/*/scripts/dev.js': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/.*/scripts': '/assets'
                },
            },
            '/scripts/dev.js': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/scripts': '/assets'
                },
            },
            '/*/scripts/app.js': {
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/.*/scripts': '/scripts'
                },
            },
        },
    },
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

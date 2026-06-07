const path = require( 'path' );

const defaultRewrite = function ( path, req ) {
    return '/index.html';
};

const assetsRewrite = function ( path, req ) {
    if (
        path.match( '/assets/theme-light.css' ) ||
        path.match( '/assets/theme-dark.css' ) ||
        path.match( '/assets/theme-light.map' ) ||
        path.match( '/assets/theme-dark.map' )
    ) {
        return path.replace( '/assets', '' );
    }

    const matches = path.match( /\/.+?(\/.*)/ );

    return matches[ 1 ];
};

module.exports = {
    entry: './app/index.jsx',
    mode: 'development',
    module: {
        rules: [
            {
                exclude: /(node_modules)/,
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/env',
                            '@babel/react',
                        ],
                    },
                },
            },
        ],
    },
    devtool: 'source-map',
    devServer: {
        server: 'https',
        host: '0.0.0.0',
        port: 9000,
        devMiddleware: {
            publicPath: "https://0.0.0.0:9000/scripts/",
        },
        static: {
            directory: path.join( __dirname, 'dev' ),
            watch: true,
        },
        // webpack-dev-server 5 requires the array form for proxy config.
        proxy: [
            {
                context: [ '/*/*.html', '/*/' ],
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: defaultRewrite,
            },
            {
                context: [ '/*/assets/**' ],
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: assetsRewrite,
            },
            {
                context: [ '/*/scripts/dev.js' ],
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/.*/scripts': '/assets'
                },
            },
            {
                context: [ '/scripts/dev.js' ],
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/scripts': '/assets'
                },
            },
            {
                context: [ '/*/scripts/app.js' ],
                target: 'https://0.0.0.0:9000',
                secure: false,
                pathRewrite: {
                    '^/.*/scripts': '/scripts'
                },
            },
        ],
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
        // webpack 5 dropped automatic node core-module polyfills; the app's
        // querystring usage (actions.js / reducers.js) needs this shim.
        fallback: {
            querystring: require.resolve( 'querystring-es3' ),
        },
    },
};

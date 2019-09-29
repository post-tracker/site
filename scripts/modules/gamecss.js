const path = require( 'path' );
const fs = require( 'fs' );
const https = require( 'https' );

const sass = require( 'node-sass' );
const postcss = require( 'postcss' );
const cssnano = require( 'cssnano' );

const LIGHT_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-light.scss' );
const DARK_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-dark.scss' );

module.exports = function( game, type, targetFolder ) {
    const lightBaseResult = sass.renderSync( {
        file: LIGHT_SOURCE_FILE,
        sourceMap: true,
        outFile: path.join( path.dirname( LIGHT_SOURCE_FILE ), 'theme-light' ),
    } );

    const darkBaseResult = sass.renderSync( {
        file: DARK_SOURCE_FILE,
        sourceMap: true,
        outFile: path.join( path.dirname( DARK_SOURCE_FILE ), 'theme-dark' ),
    } );

    const baseStyles = {
        'dark': darkBaseResult.css.toString(),
        'light': lightBaseResult.css.toString(),
    };
    let gameStyles = false;

    try {
        const gameSassResult = sass.renderSync( {
            file: path.join( __dirname, '..', '..', 'games', game, `theme-${ type }.scss` ),
            sourceMap: true,
        } );

        if ( gameSassResult ) {
            gameStyles = gameSassResult.css.toString();
        }
    } catch( readError ) {
        // We don't care if we can't read it
        if ( readError.status !== 3 ) {
            console.log( readError );
        }
    }

    if ( !gameStyles ) {
        gameStyles = baseStyles[ type ];
    }

    postcss([cssnano])
        .process(gameStyles, { from: 'src/app.css', to: 'dest/app.css' })
        .then(result => {
            fs.writeFile('dest/app.css', result.css, () => true)
            if ( result.map ) {
                fs.writeFile('dest/app.css.map', result.map, () => true)
            }
        })

    return gameStyles;
};

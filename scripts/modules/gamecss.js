const path = require( 'path' );
const fs = require( 'fs' );
const https = require( 'https' );

const sass = require( 'node-sass' );

const LIGHT_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-light.scss' );
const DARK_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-dark.scss' );

module.exports = function( game, type ) {
    const lightBaseResult = sass.renderSync( {
        file: LIGHT_SOURCE_FILE,
    } );

    const darkBaseResult = sass.renderSync( {
        file: DARK_SOURCE_FILE,
    } );

    const baseStyles = {
        'theme-dark': darkBaseResult.css.toString(),
        'theme-light': lightBaseResult.css.toString(),
    };
    let gameStyles = false;

    try {
        const gameSassResult = sass.renderSync( {
            file: path.join( __dirname, '..', 'games', identifier, `${ type }.scss` ),
        } );

        if ( gameSassResult ) {
            gameStyles = gameSassResult.css.toString();
        }
    } catch( readError ) {
        // We don't care if we can't read it
    }

    if ( !gameStyles ) {
        gameStyles = baseStyles[ type ];
    }

    return gameStyles;
};

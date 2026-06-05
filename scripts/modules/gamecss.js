const path = require( 'path' );
const fs = require( 'fs' );

const sass = require( 'sass' );

const LIGHT_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-light.scss' );
const DARK_SOURCE_FILE = path.join( __dirname, '..', '..', 'web-assets', 'theme-dark.scss' );

module.exports = function( game, type ) {
    const baseSourceFile = type === 'dark' ? DARK_SOURCE_FILE : LIGHT_SOURCE_FILE;
    const gameThemeFile = path.join( __dirname, '..', '..', 'games', game, `theme-${ type }.scss` );

    let gameStyles = false;

    if ( fs.existsSync( gameThemeFile ) ) {
        try {
            gameStyles = sass.compile( gameThemeFile ).css;
        } catch ( compileError ) {
            console.log( compileError );
        }
    }

    if ( !gameStyles ) {
        gameStyles = sass.compile( baseSourceFile ).css;
    }

    return gameStyles;
};

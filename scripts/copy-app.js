const path = require( 'path' );
const fs = require( 'fs' );

// Make sure the dist folder exists
const distPath = path.join( __dirname, '/../dist' );

/* eslint-disable no-sync */
try {
    fs.accessSync( distPath );
} catch ( error ) {
    fs.mkdirSync( distPath );
}

const games = fs.readdirSync( path.join( __dirname, '/../games' ) );
const appData = fs.readFileSync( path.join( __dirname, '/../web/scripts/app.js' ) );

/* eslint-enable no-sync */

games.forEach( ( game ) => {
    fs.writeFile( path.join( __dirname, '/../dist', game, 'scripts/app.js' ), appData, ( error ) => {
        if ( error ) {
            throw error;
        }
    } );
} );

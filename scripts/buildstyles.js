const path = require( 'path' );
const fs = require( 'fs' );
const https = require( 'https' );

const sass = require( 'node-sass' );

const promiseGet = function promiseGet( requestUrl ) {
    return new Promise( ( resolve, reject ) => {
        console.log( `Loading ${ requestUrl }` );

        const request = https.get( requestUrl, ( response ) => {
            if ( response.statusCode < 200 || response.statusCode > 299 ) {
                reject( new Error( `Failed to load ${ requestUrl }, status code: ${ response.statusCode }` ) );
            }

            const body = [];

            console.log( `Done with ${ requestUrl }` );

            response.on( 'data', ( chunk ) => {
                body.push( chunk );
            } );

            response.on( 'end', () => {
                resolve( body.join( '' ) );
            } );
        } );

        request.on( 'error', ( requestError ) => {
            reject( requestError );
        } );
    } );
};

const LIGHT_SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'light.scss' );
const DARK_SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'dark.scss' );

const lightBaseResult = sass.renderSync( {
    file: LIGHT_SOURCE_FILE,
} );

const darkBaseResult = sass.renderSync( {
    file: DARK_SOURCE_FILE,
} );

const baseStyles = {
    dark: darkBaseResult.css.toString(),
    light: lightBaseResult.css.toString(),
};

const writeStyle = function writeStyle( identifier, type ) {
    let gameStyles = false;
    const writePath = path.join( __dirname, '..', 'dev', identifier );

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

    try {
        fs.mkdirSync( writePath );
    } catch ( createDirError ) {
        // We don't care if it already exists
    }

    fs.writeFileSync( path.join( writePath, `${ type }.css` ), gameStyles );
};

promiseGet( 'https://api.developertracker.com/games' )
      .then( ( gamesBody ) => {
          const games = JSON.parse( gamesBody );
          writeStyle( 'assets', 'light' );
          writeStyle( 'assets', 'dark' );

          for ( const game of games.data ) {
              writeStyle( game.identifier, 'light' );
              writeStyle( game.identifier, 'dark' );
          }
      } )
      .catch( ( requestError ) => {
          throw requestError;
      } );

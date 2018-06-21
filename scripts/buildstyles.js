const path = require( 'path' );
const fs = require( 'fs' );
const https = require( 'https' );

const gameCss = require( './modules/gamecss' );

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

const writeStyle = function writeStyle( identifier, type ) {
    const writePath = path.join( __dirname, '..', 'dev', identifier );
    const gameStyles = gameCss( identifier, type );

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
          writeStyle( 'assets', 'theme-light' );
          writeStyle( 'assets', 'theme-dark' );

          for ( const game of games.data ) {
              writeStyle( game.identifier, 'theme-light' );
              writeStyle( game.identifier, 'theme-dark' );
          }
      } )
      .catch( ( requestError ) => {
          throw requestError;
      } );

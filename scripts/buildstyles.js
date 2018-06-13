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

const SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'styles.scss' );

const sassResult = sass.renderSync( {
    file: SOURCE_FILE,
} );

promiseGet( 'https://api.developertracker.com/games' )
      .then( ( gamesBody ) => {
          const games = JSON.parse( gamesBody );

          for ( const game of games.data ) {
              let localStyles = false;
              let gameStyle = sassResult.css.toString();
              const writePath = path.join( __dirname, '..', 'dev', game.identifier );

              try {
                  localStyles = fs.readFileSync( path.join( __dirname, '..', 'games', game.identifier, 'styles.css' ) );
              } catch( readError ) {
                  // We don't care if we can't read it
              }

              if ( localStyles ) {
                  gameStyle = `${ gameStyle }\n${ localStyles }`;
              }

              try {
                  fs.mkdirSync( writePath );
              } catch ( createDirError ) {
                  // We don't care if it already exists
              }

              fs.writeFileSync( path.join( writePath, 'styles.css' ), gameStyle );
          }
      } )
      .catch( ( requestError ) => {
          throw requestError;
      } );

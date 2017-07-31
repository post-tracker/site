/* eslint-disable no-sync */

const path = require( 'path' );
const https = require( 'https' );

const fs = require( 'fs-extra' );
const mustache = require( 'mustache' );
const postcss = require( 'postcss' );
const cssnano = require( 'cssnano' );

// Make sure the dist folder exists
const distPath = path.join( __dirname, '/../dist' );


const promiseGet = function( url ) {
    return new Promise( ( resolve, reject ) => {
        const request = https.get( url, ( response ) => {
            if ( response.statusCode < 200 || response.statusCode > 299 ) {
                reject( new Error( 'Failed to load page, status code: ' + response.statusCode ) );
            }

            const body = [];

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

try {
    fs.accessSync( distPath );
} catch ( error ) {
    fs.mkdirSync( distPath );
}

const addGameProperty = function addGameProperty( games, property, value ) {
    for ( const identifier in games ) {
        games[ identifier ][ property ] = value;
    }
};

const games = fs.readdirSync( path.join( __dirname, '/../games' ) );
const gameExtraData = {};

for ( let i = 0; i < games.length; i = i + 1 ) {
    gameExtraData[ games[ i ] ] = {
        identifier: games[ i ],
    };
}

const polyfills = fs.readFileSync( path.join( __dirname, '/../web-assets/polyfills.js' ), 'utf8' );
addGameProperty( gameExtraData, 'polyfills', polyfills );

// Styles
const generalStyles = fs.readFileSync( path.join( __dirname, '/../web-assets/bootswatch.css' ), 'utf8' );
const trackerStyles = fs.readFileSync( path.join( __dirname, '/../web-assets/styles.css' ), 'utf8' );
const globalStyles = `${ generalStyles }\n${ trackerStyles }`;

addGameProperty( gameExtraData, 'version', Date.now() );

const servicePromises = [];

for ( const identifier in gameExtraData ) {
    const servicePromise = promiseGet( `https://api.kokarn.com/${ identifier }/services` )
        .then( ( servicesResponse ) => {
            let services = JSON.parse( servicesResponse ).data;

            // If we only have one service, treat it as none
            if ( services.length === 1 ) {
                services = [];
            }

            // Transform service names to objects
            services = services.map( ( name ) => {
                return {
                    active: true,
                    name: name,
                };
            } );

            gameExtraData[ identifier ].services = JSON.stringify( services );
        } )
        .catch( ( serviceError ) => {
            throw serviceError;
        } );

    servicePromises.push( servicePromise );
}

const groupPromises = [];

for ( const identifier in gameExtraData ) {
    const groupPromise = promiseGet( `https://api.kokarn.com/${ identifier }/groups` )
        .then( ( groupsResponse ) => {
            let groups = JSON.parse( groupsResponse ).data;

            // If we only have one group, treat it as none
            if ( groups.length === 1 ) {
                groups = [];
            }

            // Transform group names to objects
            groups = groups.map( ( name ) => {
                return {
                    active: true,
                    name: name,
                };
            } );

            gameExtraData[ identifier ].groups = JSON.stringify( groups );
        } )
        .catch( ( groupError ) => {
            throw groupError;
        } );

    groupPromises.push( groupPromise );
}

postcss( [ cssnano ] )
    .process( globalStyles )
    .then( ( result ) => {
        addGameProperty( gameExtraData, 'builtStyles', result.css );
    } )
    .then( () => {
        // Wait for a bunch of promises
        return Promise.all( [
            Promise.all( servicePromises ),
            Promise.all( groupPromises ),
        ] );
    } )
    .then( () => {
        buildGames();
    } )
    .catch( ( chainError ) => {
        throw chainError;
    } );

const buildGames = function buildGames() {
    games.forEach( ( game ) => {
        const gamePath = path.join( __dirname, `/../dist/${ game }` );
        const gameFilesPath = path.join( __dirname, `/../games/${ game }` );
        let maintenanceFile = false;
        const customFiles = [
            'android-chrome-192x192.png',
            'android-chrome-512x512.png',
            'apple-touch-icon.png',
            'assets',
            'browserconfig.xml',
            'favicon-16x16.png',
            'favicon-32x32.png',
            'favicon.ico',
            'manifest.json',
            'mstile-150x150.png',
            'safari-pinned-tab.svg',
        ];
        const rewriteFiles = [
            'index.html',
            'service-worker.js',
            'rss.php',
        ];
        const hasLogo = fs.existsSync( path.join( gamePath, '/assets/logo.png' ) );
        let gameData;

        try {
            gameData = JSON.parse( fs.readFileSync( path.join( __dirname, `/../games/${ game }/data.json` ), 'utf8' ) );
        } catch ( parseError ) {
            console.error( `Invalid game data file for ${ game }. Probably just incorrect JSON. Please fix <3 (Won't build until you do...)` );

            return false;
        }

        gameData = Object.assign( {}, gameData, gameExtraData[ game ] );

        try {
            fs.accessSync( gamePath );
        } catch ( error ) {
            fs.mkdirSync( gamePath );
        }

        try {
            fs.accessSync( path.join( gamePath, '/maintenance.html' ) );
            maintenanceFile = fs.readFileSync( path.join( gamePath, '/maintenance.html' ), 'utf8' );
        } catch ( error ) {
            // If doesn't exist we don't really have to do anything
        }

        // Remove everything
        const gameFiles = fs.readdirSync( gamePath );

        gameFiles.forEach( ( fileOrFolder ) => {
            fs.removeSync( path.join( gamePath, `/${ fileOrFolder }` ) );

            return true;
        } );

        // Write a temporary maintenance file
        if ( maintenanceFile ) {
            fs.writeFileSync( path.join( gamePath, '/index.html' ), maintenanceFile );
        }

        // Copy all files from the web directory
        fs.copySync( path.join( __dirname, '/../web/' ), gamePath, {
            clobber: true,
        } );

        fs.writeFileSync( path.join( gamePath, '/assets/styles.min.css' ), gameData.builtStyles );

        // Copy all extra files
        const extraFiles = fs.readdirSync( gameFilesPath );

        extraFiles.forEach( ( filename ) => {
            // Skip files not marked for copy
            if ( customFiles.indexOf( filename ) < 0 ) {
                return true;
            }

            // Copy over the file
            fs.copySync( path.join( gameFilesPath, `/${ filename }` ), path.join( gamePath,  `/${ filename }` ), {
                clobber: true,
            } );

            return true;
        } );

        if ( extraFiles.indexOf( 'styles.css' ) > -1  ) {
            gameData.styles = fs.readFileSync( path.join( gameFilesPath, '/styles.css' ) );
        }

        if ( hasLogo ) {
            gameData.logo = '<img src="assets/logo.png" class="header-logo">';
        } else {
            gameData.logo = gameData.shortName;
        }

        for ( let i = 0; i < rewriteFiles.length; i = i + 1 ) {
            // Fill in the data where needed
            fs.readFile( path.join( gamePath, rewriteFiles[ i ] ), 'utf8', ( readFileError, fileData ) => {
                if ( readFileError ) {
                    console.log( readFileError );

                    return false;
                }

                fs.writeFile( path.join( gamePath, rewriteFiles[ i ] ), mustache.render( fileData, gameData ), ( writeFileError ) => {
                    if ( writeFileError ) {
                        console.log( writeFileError );
                    }
                } );

                return true;
            } );
        }

        return true;
    } );
};

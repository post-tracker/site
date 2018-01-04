/* eslint-disable no-sync */

const path = require( 'path' );
const https = require( 'https' );
const url = require( 'url' );

const fs = require( 'fs-extra' );
const mustache = require( 'mustache' );
const postcss = require( 'postcss' );
const cssnano = require( 'cssnano' );

const distPath = path.join( __dirname, '/../dist' );
const KEYS = require( '../config/keys.json' );
const API_TOKEN = KEYS.API_KEY;

if ( !API_TOKEN ) {
    throw new Error( 'Unable to load api key' );
}

// Make sure the dist folder exists
try {
    fs.accessSync( distPath );
} catch ( error ) {
    fs.mkdirSync( distPath );
}

const promiseGet = function promiseGet( requestUrl, headers = false ) {
    return new Promise( ( resolve, reject ) => {
        let httpsGet = requestUrl;
        if ( headers ) {
            const urlParts = url.parse( requestUrl );

            httpsGet = {
                headers: headers,
                hostname: urlParts.hostname,
                path: urlParts.path,
            };
        }

        const request = https.get( httpsGet, ( response ) => {
            if ( response.statusCode < 200 || response.statusCode > 299 ) {
                reject( new Error( `Failed to load ${ requestUrl }, status code: ${ response.statusCode }` ) );
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

const getGames = async function getGames() {
    const gamesConfigResponse = await promiseGet( 'https://api.kokarn.com/games', {
        Authorization: `Bearer ${ API_TOKEN }`,
    } );
    const allGamesConfig = JSON.parse( gamesConfigResponse );
    const gamesConfig = {};

    allGamesConfig.data.forEach( ( gameConfig ) => {
        gamesConfig[ gameConfig.identifier ] = gameConfig;
    } );

    return gamesConfig;
};

const buildGames = function buildGames( games ) {
    for ( gameIdentifier in games ) {
        console.log( `Building ${ gameIdentifier }` );
        const gameData = games[ gameIdentifier ];
        const gamePath = path.join( __dirname, `/../dist/${ gameIdentifier }` );
        const gameFilesPath = path.join( __dirname, `/../games/${ gameIdentifier }` );
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
        let extraFiles = [];

        try {
            extraFiles = fs.readdirSync( gameFilesPath );
        } catch ( readDirError ) {
            // Do nothing, the folder just doesn't exist
        }

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

        console.log( `Build ${ gameIdentifier } done` );
    }
};

const run = async function run() {
    const games = await getGames();
    const addGameProperty = function addGameProperty( property, value ) {
        for ( const identifier in games ) {
            games[ identifier ][ property ] = value;
        }
    };
    const polyfills = fs.readFileSync( path.join( __dirname, '/../web-assets/polyfills.js' ), 'utf8' );
    addGameProperty( 'polyfills', polyfills );

    // Styles
    const generalStyles = fs.readFileSync( path.join( __dirname, '/../web-assets/bootswatch.css' ), 'utf8' );
    const trackerStyles = fs.readFileSync( path.join( __dirname, '/../web-assets/styles.css' ), 'utf8' );
    const globalStyles = `${ generalStyles }\n${ trackerStyles }`;

    addGameProperty( 'version', Date.now() );

    const servicePromises = [];

    for ( const identifier in games ) {
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

                games[ identifier ].services = JSON.stringify( services );
            } )
            .catch( ( serviceError ) => {
                throw serviceError;
            } );

        servicePromises.push( servicePromise );
    }

    const groupPromises = [];

    for ( const identifier in games ) {
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

                games[ identifier ].groups = JSON.stringify( groups );
            } )
            .catch( ( groupError ) => {
                throw groupError;
            } );

        groupPromises.push( groupPromise );
    }

    postcss( [ cssnano ] )
        .process( globalStyles )
        .then( ( result ) => {
            addGameProperty( 'builtStyles', result.css );
        } )
        .then( () => {
            // Wait for a bunch of promises
            return Promise.all( [
                Promise.all( servicePromises ),
                Promise.all( groupPromises ),
            ] );
        } )
        .then( () => {
            buildGames( games );
        } )
        .catch( ( chainError ) => {
            throw chainError;
        } );
};

run();

/* eslint-disable max-len, no-sync */

/* eslint-disable no-octal */
const DATABASE_FILE_PERMISSION = 0777;
const CRON_FILE_PERMISSION = 0644;

/* eslint-enable no-octal */

const CRON_INTERVAL = 5;

const path = require( 'path' );

const fs = require( 'fs-extra' );
const mustache = require( 'mustache' );

const DatabaseSetup = require( './dbsetup.js' );

const varsToPHP = function varsToPHP ( varObject ) {
    let returnString = '';

    if ( typeof varObject !== 'object' ) {
        return returnString;
    }

    for ( const service in varObject ) {
        if ( !Reflect.apply( {}.hasOwnProperty, varObject, [ service ] ) ) {
            return false;
        }

        returnString = `${ returnString }\n$${ service } = array();`;

        for ( const identifier in varObject[ service ] ) {
            if ( !Reflect.apply( {}.hasOwnProperty, varObject[ service ], [ identifier ] ) ) {
                return false;
            }

            if( typeof varObject[ service ][ identifier ] === 'string' ){
                returnString = `${ returnString }\n$${ service }[ '${ identifier }' ] = '${ varObject[ service ][ identifier ] }';`;
            } else {
                returnString = `${ returnString }\n$${ service }[ '${ identifier }' ] = array( ${ varObject[ service ][ identifier ].map( ( element ) => {
                    return `'${ element }'`;
                } ).join( ', ' ) } );`;
            }
        }
    }

    return returnString;
};

const varsToCron = function varsToCron ( gameName, varsList, doWhenDone ) {
    let cronOutput = 'MAILTO=""\n';
    const cronConfigPath = path.join( __dirname, '../config/cron/' );
    const cronFilename = path.join( cronConfigPath, gameName );

    for ( let i = 0; i < varsList.length; i = i + 1 ) {
        const minuteOffset = i % CRON_INTERVAL;

        cronOutput = `${ cronOutput }${ minuteOffset }-59/${ CRON_INTERVAL } * * * * root lynx -dump "http://localhost/${ gameName }/actions/update.php?type=${ varsList[ i ] }" > /dev/null 2>&1\n`;
    }

    // Make sure the cron config path exists
    try {
        fs.accessSync( cronConfigPath );
    } catch ( error ) {
        fs.mkdirSync( cronConfigPath );
    }

    fs.writeFile( cronFilename, cronOutput, ( error ) => {
        doWhenDone( error, cronFilename );
    } );
};

// Make sure the dist folder exists
const distPath = path.join( __dirname, '/../dist' );

try {
    fs.accessSync( distPath );
} catch ( error ) {
    fs.mkdirSync( distPath );
}

const games = fs.readdirSync( path.join( __dirname, '/../games' ) );

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
    const gameData = JSON.parse( fs.readFileSync( path.join( __dirname, `/../games/${ game }/data.json` ), 'utf8' ) );

    gameData.services = [];

    for ( let developerIndex = 0; developerIndex < gameData.developers.length; developerIndex = developerIndex + 1 ) {
        for ( const service in gameData.developers[ developerIndex ].accounts ) {
            if ( gameData.services.indexOf( service ) === -1 ) {
                gameData.services.push( service );
            }
        }
    }

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

    // Remove everything but the data folder
    const gameFiles = fs.readdirSync( gamePath );

    gameFiles.forEach( ( fileOrFolder ) => {
        if ( fileOrFolder === 'data' ) {
            return true;
        }

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

    // Create and/or update cron files
    varsToCron( game, gameData.services, ( error, cronFilename ) => {
        if ( error ) {
            throw error;
        }

        const parsedFilename = path.parse( cronFilename );

        fs.access( '/etc/cron.d/', ( fs.constants || fs ).W_OK, ( cronPathAccessError ) => {
            if ( cronPathAccessError ) {
                console.log( `Can't write to /etc/cron.d/\nSkipping symlink of ${ cronFilename }` );

                return false;
            }

            fs.copy( cronFilename, path.join( '/etc/cron.d/', parsedFilename.base ), ( cronCopyError ) => {
                if ( cronCopyError ) {
                    throw cronCopyError;
                }

                fs.chmod( path.join( '/etc/cron.d/', parsedFilename.base ), CRON_FILE_PERMISSION );
            } );

            return true;
        } );
    } );

    // Create database if it doesn't exist
    fs.ensureFileSync( path.join( gamePath, '/data/database.sqlite' ) );
    fs.chmod( path.join( gamePath, '/data' ), DATABASE_FILE_PERMISSION );
    fs.chmod( path.join( gamePath, '/data/database.sqlite' ), DATABASE_FILE_PERMISSION );

    if ( gameData.config ) {
        fs.appendFile( path.join( gamePath, 'includes/config.php' ), varsToPHP( gameData.config ), ( error ) => {
            if ( error ) {
                throw error;
            }
        } );
    }

    // Setup database things
    const gameDatabaseSetup = new DatabaseSetup( path.join( gamePath, '/data/database.sqlite' ) );

    gameDatabaseSetup.setDevelopers( gameData.developers );
    gameDatabaseSetup.run();

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

    // Fill in the data where needed
    fs.readFile( path.join( gamePath, '/index.html' ), 'utf8', ( readFileError, fileData ) => {
        if ( readFileError ) {
            console.log( readFileError );
        }

        if ( extraFiles.indexOf( 'styles.css' ) > -1  ) {
            gameData.styles = fs.readFileSync( path.join( gameFilesPath, '/styles.css' ) );
        }

        fs.writeFile( path.join( gamePath, '/index.html' ), mustache.render( fileData, gameData ), ( writeFileError ) => {
            if ( writeFileError ) {
                console.log( writeFileError );
            }
        } );
    } );
} );

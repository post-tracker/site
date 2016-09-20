const path = require( 'path' );

const fs = require( 'fs-extra' );
const mustache = require( 'mustache' );

const DatabaseSetup = require( './dbsetup.js' );

const varsToPHP = function varsToPHP( varObject ){
    let returnString = '';

    for( let service in varObject ){
        returnString = `${ returnString }\n$${ service } = array();`;

        for( let identifier in varObject[ service ] ){
            returnString = `${ returnString }\n$${ service }[ '${ identifier }' ] = '${ varObject[ service ][ identifier ] }';`;
        }
    }

    return returnString;
};

const varsToCron = function varsToCron( gameName, varsList, callback ){
    let cronOutput = '';
    let cronFilename = path.join( __dirname, '../config/cron/', gameName );

    for( let i = 0; i < varsList.length; i = i + 1 ){
        cronOutput = `${ cronOutput }* * * * * root lynx -dump "http://localhost/${ gameName }/actions/update.php?type=${ varsList[ i ] }" > /home/ubuntu/cronlog\n`;
    }

    cronOutput = `${ cronOutput }* * * * * root lynx -dump "http://example.com/" > /home/ubuntu/cronlog\n`;

    fs.writeFile( cronFilename, cronOutput, ( error ) => {
        callback( error, cronFilename );
    } );
};

// Make sure the dist folder exists
let distPath = path.join( __dirname + '/../dist' );
try {
    fs.accessSync( distPath );
} catch ( error ){
    fs.mkdirSync( distPath );
}

let games = fs.readdirSync( path.join( __dirname + '/../games' ) );

games.forEach( ( game ) => {
    let gamePath = path.join( __dirname + '/../dist/' + game );
    let gameFilesPath = path.join( __dirname + '/../games/' + game );
    let maintenanceFile = false;
    let customFiles = [
        'favicon.ico',
        'favicon.png',
        'assets'
    ];
    let gameData = JSON.parse( fs.readFileSync( path.join( __dirname + '/../games/' + game + '/data.json' ), 'utf8' ) );
    gameData.services = [];

    for( let developerIndex = 0; developerIndex < gameData.developers.length; developerIndex = developerIndex + 1 ){
        for ( let service in gameData.developers[ developerIndex ].accounts ){
            if ( gameData.services.indexOf( service ) === -1 ){
                gameData.services.push( service );
            }
        }
    }

    try {
        fs.accessSync( gamePath );
    } catch ( error ){
        fs.mkdirSync( gamePath );
    }

    try {
        fs.accessSync( gamePath + '/maintenance.html' );
        maintenanceFile = fs.readFileSync( gamePath + '/maintenance.html', 'utf8' );
    } catch ( error ){
        // If doesn't exist we don't really have to do anything
    }

    // Remove everything but the data folder
    let gameFiles = fs.readdirSync( gamePath );

    gameFiles.forEach( ( fileOrFolder ) => {
        if ( fileOrFolder === 'data' ){
            return true;
        }

        fs.removeSync( gamePath + '/' + fileOrFolder );
    } );

    // Write a temporary maintenance file
    if ( maintenanceFile ){
        fs.writeFileSync( gamePath + '/index.html', maintenanceFile );
    }

    // Copy all files from the web directory
    fs.copySync( path.join( __dirname + '/../web/' ), gamePath, {
        clobber: true
    } );

    // Create and/or update cron files
    varsToCron( game, gameData.services, ( error, cronFilename ) => {
        if( error ){
            throw error;
        }

        let parsedFilename = path.parse( cronFilename );

        fs.access( '/etc/cron.d/', fs.constants.W_OK, ( error ) => {
            if( error ){
                console.log( `Can't write to /etc/cron.d/\nSkipping symlink of cronFilename` );

                return false;
            }

            fs.copy( cronFilename, path.join( '/etc/cron.d/', parsedFilename.base ), ( error ) => {
                if( error ){
                    throw error;
                }

                fs.chmod( path.join( '/etc/cron.d/', parsedFilename.base ), 0644 );
            } );

            return true;
        });

    } );

    // Create database if it doesn't exist
    fs.ensureFileSync( path.join( gamePath + '/data' ) + '/database.sqlite' );
    fs.chmod( path.join( gamePath + '/data' ), 0777 );
    fs.chmod( path.join( gamePath + '/data' ) + '/database.sqlite', 0777 );

    if( gameData.config ){
        fs.appendFile( path.join( gamePath, 'includes/config.php' ), varsToPHP( gameData.config ), ( error ) => {
            if( error ){
                throw error;
            }
        });
    }

    // Setup database things
    let gameDatabaseSetup = new DatabaseSetup( path.join( gamePath + '/data' ) + '/database.sqlite' );

    gameDatabaseSetup.setDevelopers( gameData.developers );
    gameDatabaseSetup.run();

    // Copy all extra files
    let extraFiles = fs.readdirSync( gameFilesPath );

    extraFiles.forEach( ( filename ) => {

        // Skip files not marked for copy
        if ( customFiles.indexOf( filename ) < 0 ){
            return true;
        }

        // Copy over the file
        fs.copySync( gameFilesPath + '/' + filename, gamePath + '/' + filename, {
            clobber: true
        } );
    } );

    // Fill in the data where needed
    fs.readFile( gamePath + '/index.html', 'utf8', ( error, fileData ) => {
        if( error ){
            console.log( error );
        }

        if ( extraFiles.indexOf( 'styles.css' ) > -1  ){
            gameData.styles = fs.readFileSync( gameFilesPath + '/styles.css' );
        }

        fs.writeFile( gamePath + '/index.html', mustache.render( fileData, gameData ), ( error ) => {
            if ( error ){
                console.log( error );
            }
        })
    } );
});

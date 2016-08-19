const path = require( 'path' );

const fs = require( 'fs-extra' );
const mustache = require( 'mustache' );

const DatabaseSetup = require( './dbsetup.js' );

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
    let maintenanceFile = false;
    let gameData = JSON.parse( fs.readFileSync( path.join( __dirname + '/../games/' + game + '/data.json' ), 'utf8' ) );

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

    // Create database if it doesn't exist
    fs.ensureFileSync( path.join( gamePath + '/data' ) + '/database.sqlite' );

    // Setup database things
    let gameDatabaseSetup = new DatabaseSetup( path.join( gamePath + '/data' ) + '/database.sqlite' );

    gameDatabaseSetup.setDevelopers( gameData.developers );
    gameDatabaseSetup.run();

    fs.readFile( gamePath + '/index.html', 'utf8', ( error, fileData ) => {
        if( error ){
            console.log( error );
        }

        fs.writeFile( gamePath + '/index.html', mustache.render( fileData, gameData ), ( error ) => {
            if ( error ){
                console.log( error );
            }
        })
    } );
});

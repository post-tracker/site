/* eslint-disable max-len */

const ARGUMENTS_START = 2;
const JSON_TAB_SIZE = 4;

const fs = require( 'fs' );

const csvParse = require( 'csv-parse' );
const nano = require( 'nano' )( 'http://localhost:5984' );

const argv = require( 'minimist' )( process.argv.slice( ARGUMENTS_START ) );

const database = nano.db.use( 'people' );
const baseProperties = [
    'name',
    'nick',
    'group',
    'role',
    'active',
];

const output = [];

const parser = csvParse( {
    delimiter: ',',
} );

// eslint-disable-next-line no-sync
const currentData = JSON.parse( fs.readFileSync( argv.destination, 'utf8' ) );

const parseOuput = function parseOuput ( input ) {
    const developers = [];
    let headers;

    for ( let i = 0; i < input.length; i = i + 1 ) {
        const currentDeveloper = {
            accounts: {},
        };

        if ( i === 0 ) {
            headers = input[ i ];
            continue;
        }

        for ( let fieldIndex = 0; fieldIndex < input[ i ].length; fieldIndex = fieldIndex + 1 ) {
            const fieldData = input[ i ][ fieldIndex ].trim();

            if ( fieldData.length === 0 ) {
                continue;
            }

            if ( baseProperties.indexOf( headers[ fieldIndex ].toLowerCase() ) > -1 ) {
                currentDeveloper[ headers[ fieldIndex ].toLowerCase() ] = fieldData;
            } else {
                currentDeveloper.accounts[ headers[ fieldIndex ].replace( /\s/gim, '' ) ] = fieldData;
            }
        }

        developers.push( currentDeveloper );
    }

    return developers;
};

parser.on( 'readable', () => {
    let record;

    while ( ( record = parser.read() ) !== null ) {
        output.push( record );
    }
} );

// Catch any error
parser.on( 'error', ( error ) => {
    console.log( error.message );
} );

// When we are done, test that the parsed output matched what expected
parser.on( 'finish', () => {
    const developers = parseOuput( output );

    for ( let i = 0; i < developers.length; i = i + 1 ) {
        developers[ i ].game = argv.game;
        database.insert( developers[ i ], `${ argv.game }-${ developers[ i ].nick }` );
    }

    return false;
    const writeData = currentData;

    writeData.developers = developers;

    if ( argv.destination ) {
        fs.writeFile( argv.destination, JSON.stringify( writeData, null, JSON_TAB_SIZE ), ( error ) => {
            if ( error ) {
                throw error;
            }

            console.log( `Data written to ${ argv.destination }` );
        } );
    }
} );

fs.readFile( argv.source, 'utf-8', ( error, fileContents ) => {
    if ( error ) {
        throw error;
    }

    // Now that setup is done, write data to the stream
    parser.write( fileContents );

    // Close the readable stream
    parser.end();
} );

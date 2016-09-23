/* eslint-disable max-len */

const ARGUMENTS_START = 2;
const JSON_TAB_SIZE = 4;

const fs = require( 'fs' );

const csvParse = require( 'csv-parse' );

const argv = require( 'minimist' )( process.argv.slice( ARGUMENTS_START ) );

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

const parseOuput = function parseOuput ( input ) {
    const parsedData = {
        developers: [],
    };
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
            if ( input[ i ][ fieldIndex ].length === 0 ) {
                continue;
            }

            if ( baseProperties.indexOf( headers[ fieldIndex ].toLowerCase() ) > -1 ) {
                currentDeveloper[ headers[ fieldIndex ].toLowerCase() ] = input[ i ][ fieldIndex ];
            } else {
                currentDeveloper.accounts[ headers[ fieldIndex ] ] = input[ i ][ fieldIndex ];
            }
        }

        parsedData.developers.push( currentDeveloper );
    }

    return parsedData;
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
    const parsedData = parseOuput( output );

    if ( argv.name ) {
        parsedData.name = argv.name;
    }

    if ( argv.shortName ) {
        parsedData.shortName = argv.shortName;
    }

    if ( argv.hostname ) {
        parsedData.hostname = argv.hostname;
    }

    if ( argv.destination ) {
        fs.writeFile( argv.destination, JSON.stringify( parsedData, null, JSON_TAB_SIZE ), ( error ) => {
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

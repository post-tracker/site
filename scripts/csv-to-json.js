const fs = require( 'fs' );
const util = require( 'util' );

const csvParse = require( 'csv-parse' );

let argv = require( 'minimist' )( process.argv.slice( 2 ) );

const baseProperties = [
    'name',
    'nick',
    'group',
    'role',
    'active'
];

let output = [];

let parser = csvParse( {
    delimiter: ','
} );

const parseOuput = function parseOuput( input ){
    let parsedData = {
        developers: []
    };
    let headers;

    for( let i = 0; i < input.length; i = i + 1 ){
        let currentDeveloper = {
            accounts: {}
        };

        if( i === 0 ){
            headers = input[ i ];
            continue;
        }

        for( let fieldIndex = 0; fieldIndex < input[ i ].length; fieldIndex = fieldIndex + 1 ){
            if ( input[ i ][ fieldIndex ].length === 0 ) {
                continue;
            }

            if( baseProperties.indexOf( headers[ fieldIndex ].toLowerCase() ) > -1 ){
                currentDeveloper[ headers[ fieldIndex ].toLowerCase() ] = input[ i ][ fieldIndex ];
            } else {
                currentDeveloper.accounts[ headers[ fieldIndex ] ] = input[ i ][ fieldIndex ];
            }
        }

        parsedData.developers.push( currentDeveloper );
    }

    return parsedData;
};

parser.on('readable', function(){
    while( record = parser.read() ){
        output.push( record );
    }
});

// Catch any error
parser.on( 'error', ( error ) => {
    console.log( error.message );
} );

// When we are done, test that the parsed output matched what expected
parser.on( 'finish', () => {
    let parsedData = parseOuput( output );

    if( argv.name ){
        parsedData.name = argv.name;
    }

    if( argv.shortName ){
        parsedData.shortName = argv.shortName;
    }

    if( argv.hostname ){
        parsedData.hostname = argv.hostname;
    }

    if( argv.destination ){
        fs.writeFile( argv.destination, JSON.stringify( parsedData, null, 4 ), ( error ) => {
            if( error ){
                throw error;
            }

            console.log( `Data written to ${ argv.destination }` );
        } );
    }
} );

fs.readFile( argv.source, 'utf-8', ( error, data ) => {
    if( error ){
        throw error;
    }
    // Now that setup is done, write data to the stream
    parser.write( data );

    // Close the readable stream
    parser.end();
} );

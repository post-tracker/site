const fs = require( 'fs' );
const path = require( 'path' );

const AWS = require( 'aws-sdk' );
const junk = require( 'junk' );
const mime = require( 'mime-types' );

require( 'dotenv' ).config();

if ( !process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY ) {
    throw new Error( 'AWS auth not configured' );
}

const config = {
    folderPath: path.join( __dirname, '..', 'dist' ),
    s3BucketName: 'developer-tracker',
};

const s3 = new AWS.S3( {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
} );

const uploadDir = function uploadDir( s3Path, bucketName ) {
    const walkSync = function walkSync( currentDirPath, callback ) {
        fs.readdirSync( currentDirPath ).filter( junk.not ).forEach( ( name ) => {
            const filePath = path.join( currentDirPath, name );
            const stat = fs.statSync( filePath );

            if ( stat.isFile() ) {
                callback( filePath, stat );
            } else if ( stat.isDirectory() ) {
                walkSync( filePath, callback );
            }
        } );
    };

    walkSync( s3Path, ( filePath, stat ) => {
        if ( path.parse( filePath ).ext === '.php' ) {
            return true;
        }
        
        const bucketPath = filePath.substring( s3Path.length + 1 );
        const params = {
            Bucket: bucketName,
            Key: bucketPath,
            Body: fs.readFileSync( filePath ),
            ContentType: mime.lookup( filePath ),
        };

        if ( !params.ContentType ) {
            if ( path.parse( filePath ).base === 'rss' ) {
                params.ContentType = 'application/rss+xml';
            } else {
                console.log( `Failed to get content-type for ${ filePath }` );

                return true;
            }
        }

        s3.putObject( params, ( err, data ) => {
            if ( err ) {
                console.log( err )
            } else {
                console.log('Successfully uploaded '+ bucketPath +' to ' + bucketName);
            }
        } );
    } );
};

uploadDir( config.folderPath, config.s3BucketName );

const path = require( 'path' );

const mime = require( 'mime-types' );

require( 'dotenv' ).config();

if ( !process.env.AWS_ACCESS_KEY || !process.env.AWS_SECRET_KEY ) {
    throw new Error( 'AWS auth not configured' );
}

const S3_BUCKET = 'developer-tracker';
const s3 = new AWS.S3( {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
} );

const cacheControls = [
    {
        match: 'service-worker.js',
        cache: 'public, max-age=600, must-revalidate',
    },
    {
        match: '.*\.html',
        cache: 'public, max-age=600',
    },
    {
        match: '.*\.css',
        cache: 'public, max-age=31536000',
    },
    {
        match: '.*\.js',
        cache: 'public, max-age=31536000',
    },
    {
        match: '\.(jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|woff|woff2)',
        cache: 'public, max-age=2678400',
    },
    {
        match: '\.(json|xml)',
        cache: 'public, max-age=2678400',
    },
];

const getCache = function getCache ( filePath ) {
    const filename = path.parse( filePath ).base;

    for ( const cacheSetup of cacheControls ) {
        const regex = new RegExp( cacheSetup.match );

        if ( regex.test( filePath ) ) {
            return cacheSetup.cache;
        }
    }

    console.error( `No cache for ${ filename }` );

    return false;
};

module.exports = function saveFile( filePath, fileData ) {
    const params = {
        Bucket: S3_BUCKET,
        Key: filePath,
        Body: fileData,
        CacheControl: getCache( filePath ),
        ContentType: mime.lookup( filePath ),
    };

    s3.putObject( params, ( uploadError, data ) => {
        if ( uploadError ) {
            console.error( uploadError )
        } else {
            console.log( `Successfully uploaded ${ filePath } to ${ S3_BUCKET }` );
        }
    } );
};

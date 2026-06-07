const path = require( 'path' );
const fs = require( 'fs' );

// Built site is written to disk under stage/, then deployed to Cloudflare Pages
// (see scripts/build.js + the `deploy` npm script). Cache headers live in the
// generated _headers file, not per-file metadata.
const OUTPUT_PATH = path.join( __dirname, '..', '..', 'stage' );

module.exports = function saveFile( filePath, fileData ) {
    const fullPath = path.join( OUTPUT_PATH, filePath );

    fs.mkdirSync( path.parse( fullPath ).dir, {
        recursive: true,
    } );

    fs.writeFileSync( fullPath, fileData );
};

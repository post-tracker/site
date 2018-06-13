const path = require( 'path' );
const fs = require( 'fs' );

const sass = require( 'node-sass' );

const SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'styles.scss' );
const DEV_OUTPUT = path.join( __dirname, '..', 'dev', 'assets', 'styles.css' );

const sassResult = sass.renderSync( {
    file: SOURCE_FILE,
} );

fs.writeFileSync( DEV_OUTPUT, sassResult.css.toString() );

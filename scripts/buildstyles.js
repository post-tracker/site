const path = require( 'path' );
const fs = require( 'fs' );

const sass = require( 'node-sass' );

const SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'styles.scss' );
const VENDOR_SOURCE_FILE = path.join( __dirname, '..', 'web-assets', 'bootswatch.css' );
const DEV_OUTPUT = path.join( __dirname, '..', 'dev', 'assets', 'styles.css' );

const sassResult = sass.renderSync( {
    file: SOURCE_FILE,
} );

const vendorSource = fs.readFileSync( VENDOR_SOURCE_FILE );
const output = `${ vendorSource }${ sassResult.css.toString() }`;

fs.writeFileSync( DEV_OUTPUT, output );

const gulp = require( 'gulp' );
const source = require( 'vinyl-source-stream' );
const buffer = require( 'vinyl-buffer' );
const browserify = require( 'browserify' );

const bundler = browserify( 'components/App.jsx' ).transform( 'babelify', { presets: [ 'es2015', 'react' ] } );

function rebundle() {
    return bundler
        .bundle()
        .on( 'error', function( error ) {
            console.error( error );
            this.emit( 'end' );
        })
        .pipe( source( 'app.build.js' ) )
        .pipe( buffer() )
        .pipe( gulp.dest( 'web/scripts' ) );
}

gulp.task( 'build', () => {
    return rebundle();
});

gulp.task( 'watch', () => {
    // Watch .jsx files
    gulp.watch( 'components/**/*.jsx', [ 'build' ] );
});

gulp.task( 'default', [ 'build' ] );

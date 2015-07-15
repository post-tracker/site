module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),

        watch: {
            react: {
                files: 'components/*.jsx',
                tasks: [ 'browserify' ]
            },
            uglify: {
                files: 'scripts/app.built.js',
                tasks: [ 'uglify' ]
            }
        },

        browserify: {
            options: {
                transform: [ require( 'grunt-react' ).browserify ]
            },
            client: {
                src: [ 'components/**/*.jsx' ],
                dest: 'scripts/app.built.js'
            }
        },

        uglify: {
            client: {
                src: [ 'scripts/app.built.js' ],
                dest: 'scripts/app.min.js'
            }
        },

        env: {
            dev : {
                NODE_ENV : 'development'
            }
        }
    });

    grunt.loadNpmTasks( 'grunt-browserify' );
    grunt.loadNpmTasks( 'grunt-contrib-watch' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-env' );

    grunt.registerTask( 'default', [
        'browserify'
    ]);
};

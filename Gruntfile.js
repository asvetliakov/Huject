module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['tests/**/*.js']
            }
        },

        ts: {
            default: {
                src: ['src/**/*.ts'],
                tsconfig: './tsconfig.json'
            }
        }
    });


    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-ts');

    grunt.registerTask('test', ['ts', 'mochaTest']);
    grunt.registerTask('default', ['ts']);
};
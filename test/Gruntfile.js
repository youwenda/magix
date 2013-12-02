module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            files: ['../dist/1.1/*.js', '**/*Spec.js', '**/*.html'],
            options: {
                livereload: true
            },
            grunt: {
                files: ['Gruntfile.js']
            }
        }
    })

    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.registerTask('default', ['watch'])
}
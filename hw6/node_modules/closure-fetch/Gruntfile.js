var extend = require('extend');

module.exports = function (grunt) {
  var compilerOptions = {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    warning_level: 'VERBOSE',
    summary_detail_level: 3,
    language_in: 'ECMASCRIPT5_STRICT',
    output_wrapper: '(function(){%output%}());',
    use_types_for_optimization: true
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['build'],
    connect: {
      server: {
        options: {
          base: "",
          port: 9999
        }
      }
    },
    watch: {},
    exec: {
      deps: 'calcdeps -p src -p ./vendor/google/base.js -o deps > test/deps.js'
    },
    jshint: {
      all: ['src/**/*.js'],
      options: {
        // ... better written as dot notation
        "-W069": true,

        // type definitions
        "-W030": true,

        // Don't make functions within loops
        "-W083": true,

        // Wrap the /regexp/ literal in parens to disambiguate the slash operator
        "-W092": true
      }
    },
    closurecompiler: {
      dist: {
        files: {
          "fetch.js": ['src/**/*.js', 'polyfill.js']
        },
        options: extend({}, compilerOptions)
      },
      compile: {
        files: {
          "build/fetch.js": ['src/**/*.js', 'polyfill.js'],
        },
        options: extend({}, compilerOptions)
      },
      debug: {
        files: {
          "build/fetch.debug.js": ['src/**/*.js', 'polyfill.js']
        },
        options: extend({}, compilerOptions, {
          debug: true,
          formatting: ['PRETTY_PRINT', 'PRINT_INPUT_DELIMITER']
        })
      }
    },
    concat: {
      dist: {
        src: ['node_modules/promis/promise.js', 'build/fetch.js'],
        dest: 'fetch.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-closurecompiler');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('compile', ['closurecompiler:compile']);
  grunt.registerTask('debug', ['closurecompiler:debug']);
  grunt.registerTask('default', ['compile']);
  grunt.registerTask('test', ['connect', 'exec:test']);
  grunt.registerTask('dev', ['connect', 'watch']);
  grunt.registerTask('dist', ['clean', 'closurecompiler:compile', 'concat:dist']);
};

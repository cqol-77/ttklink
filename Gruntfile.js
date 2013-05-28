module.exports = function (grunt) {
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        lib:{
            base:'js/lib/base.js'
        },
        build:{
            file:{
                js:'build/ttlink.js',
                css:'build/ttklink.css',
                img:'build/'
            },
            debug:'build/debug/ttlink.js'
        },
        ttlink:{
            file:{
                js:'js/ttlink.js',
                img:'images/',
                css:'css/ttklink.css'
            }
        },
        concat:{
            ttlink:{
                src:['<%= lib.base %>', '<%= ttlink.file.js %>'],
                dest:'<%= build.debug %>'
            }
        },
        uglify:{
            ttlink:{
                options:{
                    banner:'/*! <%= pkg.name %> - by cqol_77 <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files:{
                    '<%= build.file.js %>':'<%= build.debug %>'
                }
            }
        },
        jshint:{
            ttlink:{
                options:{
                    jshintrc:'.jshintrc'
                },
                files:{
                    src:['<%= ttlink.file.js %>']
                    //src:['<%= build.debug %>']
                }
            }
        },
        replace:{
            options:{
                variables:{
                    'timestamp':'<%= new Date().getTime() %>'
                }
            },
            ttlink:{
                files:[
                    {src:['<%= build.debug %>'], dest:'<%= build.debug %>'}
                ]
            }
        },
        copy:{
            ttlink:{
                files:[
                    {expand:true, cwd:'<%= ttlink.file.img %>', src:'*', dest:'<%= build.file.img %>'}
                ]
            }
        },
        cssmin: {
            options: {
                banner:'/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            combine: {
                files: {
                    '<%= build.file.css %>': ['<%= ttlink.file.css %>']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //grunt.loadNpmTasks('grunt-contrib-htmlmin');
    //grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('ttlink', 'tts ttlink', function () {
        grunt.task.run('jshint:ttlink');
        grunt.task.run('concat:ttlink');
        grunt.task.run('replace:ttlink');
        grunt.task.run('uglify:ttlink');
    });
    grunt.registerTask('lib', 'tts ttlink', function () {
        //grunt.task.run('jshint:ttlink');
        grunt.task.run('concat:lib');
        grunt.task.run('uglify:lib');
    });
    // Default task(s).
    grunt.registerTask('default', ['uglify']);

};
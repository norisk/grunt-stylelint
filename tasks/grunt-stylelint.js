/*!
 * Run CSS files through stylelint and complain
 */

require( 'color' );

/*jshint node:true */
module.exports = function ( grunt ) {

	grunt.registerMultiTask( 'stylelint', function () {
		var options = this.options(),
			done = this.async(),
			styleLint = require( 'stylelint' ),
			verbose = !!grunt.option( 'verbose' );

		options.files = this.filesSrc.filter( function ( file ) {
			return grunt.file.isFile( file );
		} );
		options.formatter = verbose ? 'verbose' : 'string';

		styleLint.lint( options ).then( function ( data ) {
			if ( data.output ) {
				if ( verbose ) {
					grunt.log.write( data.output );
				} else if ( data.errored ) {
					grunt.log.warn( data.output );
				} else {
					grunt.log.ok( data.output );
				}
			}

            grunt.log.writeln("");

			if ( !data.errored ) {
				grunt.log.ok( 'Linted ' + options.files.length + ' files without errors' );
				done();
			} else {
				var files_errored = 0,
                    files_warned = 0,
					all_warnings = 0,
					all_errors = 0;

                for (var i = data.results.length - 1; i >= 0; i--) {
                    var warnings = 0,
                        errors = 0;

                    for (var j = data.results[i].warnings.length - 1; j >= 0; j--) {
                        switch ( data.results[i].warnings[j].severity ) {
                            case "error":
                                all_errors++;
                                errors++;
                                break;
                            case "warn":
                                all_warnings++;
                                warnings++;
                                break;
                        }
                    }

                    if (warnings > 0 || errors > 0) {

                        if (errors > 0 ) {
                            files_errored++;
                            grunt.log.write(data.results[i].source.red);
                        } else {
                            files_warned++;
                            grunt.log.write(data.results[i].source.yellow);
                        }
                        grunt.log.writeln( ( "\t" + errors + " Errors, " + warnings + " Warnings" ).grey );
                    }


                }
                grunt.log.writeln("");
                grunt.log.write('Linted ' + options.files.length + " files >> ");
                grunt.log.write(((options.files.length - files_errored - files_warned) + " files passed ").green);
                if (all_errors > 0) grunt.log.write((files_errored + " files failed with " + all_errors + " errors ").red);
                if (all_warnings > 0) grunt.log.write((files_warned + " files warned with " + all_warnings + " warnings ").yellow);
                grunt.log.writeln("");
				done( false );
			}
		}, function ( err ) {
			grunt.fail.warn( 'Running stylelint failed\n' + err.stack.toString() );

			done( false );
		} );
	} );

};

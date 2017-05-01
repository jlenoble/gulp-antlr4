import gulp from 'gulp';
import antlr4 from '../../src/gulp-antlr4.js';
import {argv} from 'yargs';

const test = () => {
  return gulp.src([
    `../sources/**/${argv.grammar || '*'}.g4`,
  ])
    .pipe(antlr4('../../build/antlr4'));
};

gulp.task('default', test);

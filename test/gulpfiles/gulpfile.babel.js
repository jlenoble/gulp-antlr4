import gulp from 'gulp';
import antlr4 from '../../src/gulp-antlr4.js';

const test = () => {
  return gulp.src([
    '../sources/**/*.g4',
  ])
    .pipe(antlr4('../../build/antlr4'));
};

gulp.task('default', test);

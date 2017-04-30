import gulp from 'gulp';
import plugin from '../../src/gulp-antlr4.js';

const test = () => {
  return gulp.src([
    'test/sources/**/*.*'
  ])
    .pipe(plugin());
}

gulp.task('default', test);

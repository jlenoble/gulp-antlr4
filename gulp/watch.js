import gulp from 'gulp';
import {build} from './build';
import {test} from './test';


const allSrcGlob = [
  'src/**/*.js',
  'test/**/*.js',
];
const allBuildGlob = [
  'build/src/**/*.js',
  'build/test/**/*.js',
];
const allGrammarGlob = [
  'test/sources/**/*',
  '!test/sources/**/*.js',
];

export const watch = done => {
  gulp.watch(allSrcGlob, build);
  gulp.watch(allBuildGlob, test);
  gulp.watch(allGrammarGlob, test);
  done();
};

gulp.task('watch', watch);

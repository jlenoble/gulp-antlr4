import gulp from 'gulp';
import {build} from './build';
import {test} from './test';


const allSrcGlob = [
  'src/**/*.js',
  'test/**/*.js'
];
const allBuildGlob = [
  'build/src/**/*.js',
  'build/test/**/*.js'
];
const allSassGlob = [
  'src/static/scss/**/*.scss'
];


export const watch = done => {
  gulp.watch(allSrcGlob, build);
  gulp.watch(allBuildGlob, test);
  done();
};

gulp.task('watch', watch);

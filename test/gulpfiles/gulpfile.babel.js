import gulp from 'gulp';
import antlr4 from '../../src/gulp-antlr4.js';
import {argv} from 'yargs';

const sourcesDir = '../sources';
const grammarGlob = [`${sourcesDir}/${argv.grammar || '*'}.g4`];
const antlrDir = `../../${argv.output || 'build/antlr4'}`;
const inputGlob = [`${sourcesDir}/${argv.input || '*.txt'}`];

const generate = () => {
  return gulp.src(grammarGlob, {since: gulp.lastRun(generate)})
    .pipe(antlr4(antlrDir));
};

const run = () => {
  return gulp.src(inputGlob, {since: gulp.lastRun(run)})
    .pipe(antlr4(antlrDir));
};

gulp.task('run', gulp.series(generate, run));
gulp.task('default', generate);

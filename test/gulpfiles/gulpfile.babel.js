import gulp from 'gulp';
import path from 'path';
import antlr4 from '../../src/gulp-antlr4.js';
import {argv} from 'yargs';

const grammarName = argv.grammar;
const outputDir = argv.output || 'build/antlr4';
const inputFile = argv.input;
const startRule = argv.rule;
const sourcesDir = '../sources';

const grammarGlob = [`${sourcesDir}/${grammarName || '*'}.g4`];
const inputGlob = [`${sourcesDir}/${inputFile || '*.txt'}`];
const rootDir = path.join(process.cwd(), '../..');
const antlrDir = path.join(rootDir, outputDir);

const generate = () => {
  return gulp.src(grammarGlob, {since: gulp.lastRun(generate)})
    .pipe(antlr4(antlrDir));
};

const run = () => {
  return gulp.src(inputGlob, {since: gulp.lastRun(run)})
    .pipe(antlr4({antlrDir, grammarName, startRule}));
};

gulp.task('run', gulp.series(generate, run));
gulp.task('default', generate);

import gulp from 'gulp';
import path from 'path';
import antlr4 from '../../src/gulp-antlr4.js';
import {argv} from 'yargs';

const processArgv = argv => {
  if (!argv || argv === 'undefined') {
    return undefined;
  }
  return argv;
};

const grammar = processArgv(argv.grammar);
const outputDir = processArgv(argv.output || 'build/antlr4');
const inputFile = processArgv(argv.input);
const rule = processArgv(argv.rule);
let grammarDir = '../sources';
const mode = processArgv(argv.mode);
const listener = processArgv(argv.listener);

const grammarGlob = [`${grammarDir}/${grammar || '*'}.g4`];
const inputGlob = [`${grammarDir}/${inputFile || '*.txt'}`];
const rootDir = path.join(process.cwd(), '../..');
const classDir = path.join(rootDir, outputDir);
grammarDir = path.join(classDir, '../test/sources');

const generate = () => {
  return gulp.src(grammarGlob, {since: gulp.lastRun(generate)})
    .pipe(antlr4(classDir));
};

const run = () => {
  return gulp.src(inputGlob, {since: gulp.lastRun(run)})
    .pipe(antlr4({classDir, grammarDir, grammar, listener, rule, mode}));
};

gulp.task('run', gulp.series(generate, run));
gulp.task('default', generate);

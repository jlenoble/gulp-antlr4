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

const grammarName = processArgv(argv.grammar);
const outputDir = processArgv(argv.output || 'build/antlr4');
const inputFile = processArgv(argv.input);
const rule = processArgv(argv.rule);
let sourcesDir = '../sources';
const mode = processArgv(argv.mode);
const listener = processArgv(argv.listener);

const grammarGlob = [`${sourcesDir}/${grammarName || '*'}.g4`];
const inputGlob = [`${sourcesDir}/${inputFile || '*.txt'}`];
const rootDir = path.join(process.cwd(), '../..');
const antlrDir = path.join(rootDir, outputDir);
sourcesDir = path.join(antlrDir, '../test/sources');

const generate = () => {
  return gulp.src(grammarGlob, {since: gulp.lastRun(generate)})
    .pipe(antlr4(antlrDir));
};

const run = () => {
  return gulp.src(inputGlob, {since: gulp.lastRun(run)})
    .pipe(antlr4({antlrDir, sourcesDir, grammarName, listener, rule,
      mode}));
};

gulp.task('run', gulp.series(generate, run));
gulp.task('default', generate);

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
const sourcesDir = '../sources';
const mode = processArgv(argv.mode);
const listener = processArgv(argv.listener);
const visitor = processArgv(argv.visitor);
const sync = !processArgv(argv.async);
const dest = processArgv(argv.dest);

const grammarGlob = [`${sourcesDir}/${grammar || '*'}.g4`];
const inputGlob = [`${sourcesDir}/${inputFile || '*.txt'}`];
const rootDir = path.join(process.cwd(), '../..');
const parserDir = path.join(rootDir, outputDir);
const listenerDir = path.join(parserDir, '../test/sources');
const visitorDir = path.join(parserDir, '../test/sources');
const destDir = dest ? path.join(rootDir, dest) : undefined;

const generate = () => {
  return gulp.src(grammarGlob, {since: gulp.lastRun(generate)})
    .pipe(antlr4({parserDir, listener, visitor}));
};

const run = () => {
  const stream = gulp.src(inputGlob, {since: gulp.lastRun(run)})
    .pipe(antlr4({parserDir, listenerDir, grammar, listener, rule, mode,
      visitorDir, visitor, sync}));

  return destDir ? stream.pipe(gulp.dest(destDir)) : stream;
};

const mixed = () => {
  const stream = gulp.src(inputGlob.concat(grammarGlob), {
    since: gulp.lastRun(mixed),
  })
    .pipe(antlr4({parserDir, listenerDir, grammar, listener, rule, mode,
      visitorDir, visitor, sync}));

  return destDir ? stream.pipe(gulp.dest(destDir)) : stream;
};

gulp.task('mixed', mixed);
gulp.task('run', gulp.series(generate, run));
gulp.task('default', generate);

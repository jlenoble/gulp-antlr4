import {makeSingleTest} from 'child-process-data';

export const outputDir = 'build/antlr4';

export const testGrammar = _options => {
  const args = [
    '--gulpfile',
    'test/gulpfiles/gulpfile.babel.js',
    '--grammar',
    _options.grammarName,
    '--output',
    _options.outputDir || outputDir,
  ];

  if (_options.visitor) {
    args.push('--visitor');
  }

  if (_options.listener) {
    args.push('--listener');
  }

  const options = Object.assign({
    childProcess: ['gulp', args],
  }, _options);

  const test = makeSingleTest(options);

  return test();
};

export const runGrammar = _options => {
  const args = [
    '--gulpfile',
    'test/gulpfiles/gulpfile.babel.js',
    '--grammar',
    _options.grammarName,
    '--output',
    _options.outputDir || outputDir,
    '--input',
    _options.inputFile,
    '--rule',
    _options.startRule,
    '--mode',
    _options.antlrMode,
    '--listener',
    _options.listenerName,
    '--visitor',
    _options.visitorName,
    'run',
  ];

  if (!_options.sync) {
    args.push('--async');
  }

  const options = Object.assign({
    childProcess: ['gulp', args],
  }, _options);

  const test = makeSingleTest(options);

  return test();
};

export const runMixedWithGrammar = _options => {
  const args = [
    '--gulpfile',
    'test/gulpfiles/gulpfile.babel.js',
    '--grammar',
    _options.grammarName,
    '--output',
    _options.outputDir || outputDir,
    '--input',
    _options.inputFile,
    '--rule',
    _options.startRule,
    '--mode',
    _options.antlrMode,
    '--listener',
    _options.listenerName,
    '--visitor',
    _options.visitorName,
    'mixed',
  ];

  if (!_options.sync) {
    args.push('--async');
  }

  const options = Object.assign({
    childProcess: ['gulp', args],
  }, _options);

  const test = makeSingleTest(options);

  return test();
};

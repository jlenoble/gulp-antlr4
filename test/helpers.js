import {makeSingleTest} from 'child-process-data';

export const outputDir = 'build/antlr4';

export const testGrammar = _options => {
  const options = Object.assign({
    childProcess: ['gulp', [
      '--gulpfile',
      'test/gulpfiles/gulpfile.babel.js',
      '--grammar',
      _options.grammarName,
      '--output',
      _options.outputDir || outputDir,
    ]],
  }, _options);

  const test = makeSingleTest(options);

  return test();
};

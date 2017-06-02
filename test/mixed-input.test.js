import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {runMixedWithGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulp-antlr4 with mixed imput', function () {
  this.timeout('10000');

  it(`Running mixed input data3.txt/ArrayInit.g4`,
  tmpDir(outputDir, function () {
    return runMixedWithGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data3.txt',
      outputDir: outputDir,
      startRule: 'init',
      listenerName: 'ShortToUnicodeString',

      checkResults (results) {
        expect(results.out()).to.match(/\\u0063\\u0003\\u01c3/);
      },
    });
  }));

  it(`Running mixed input data4.txt/Calc.g4`,
  tmpDir(outputDir, function () {
    return runMixedWithGrammar({
      grammarName: 'Calc',
      inputFile: 'data4.txt',
      outputDir: outputDir,
      startRule: 'prog',
      visitorName: 'EvalVisitor',

      checkResults (results) {
        expect(results.out()).to.match(/42424242/);
      },
    });
  }));
});

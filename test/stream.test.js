import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {streamGrammar, outputDir} from './helpers';
import {expectEventuallyFound} from 'stat-again';

describe('Testing Gulp plugin gulp-antlr4 with streams', function () {
  this.timeout('10000');

  it(`Running parser ArrayInit on good input`, tmpDir(outputDir, function () {
    return streamGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data.txt',
      outputDir: outputDir,
      startRule: 'init',
      antlrMode: 'tree',

      checkResults (results) {
        const out = '\\(init \\{ \\(value 1\\) , \\(value \\(init \\{ \\(' +
          'value 2\\) , \\(value 3\\) \\}\\)\\) , \\(value 4\\) \\}\\)';
        expect(results.out()).to.match(new RegExp(out));
      },
    });
  }));

  it(`Running parser ArrayInit on bad input`, tmpDir(outputDir, function () {
    return streamGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data2.txt',
      outputDir: outputDir,
      startRule: 'init',
      antlrMode: 'tree',

      checkResults (results) {
        const err = 'line 2:0 extraneous input \'<EOF>\' expecting \\{\',\', ' +
          '\'\\}\'\\}';
        const out = '\\(init \\{ \\(value 1\\) , \\(value 2\\) ' +
          '<missing \'\\}\'>\\)';
        expect(results.err()).to.match(new RegExp(err));
        expect(results.out()).to.match(new RegExp(out));
      },
    });
  }));

  it(`Running ArrayInit with listener ShortToUnicodeString`,
  tmpDir(outputDir, function () {
    return streamGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data3.txt',
      outputDir: outputDir,
      startRule: 'init',
      listenerName: 'ShortToUnicodeString',

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/ArrayInitListener.js`)
          .then(() => {
            expect(results.out()).to.match(/\\u0063\\u0003\\u01c3/);
          });
      },
    });
  }));

  it(`Running Calc with visitor EvalVisitor`,
  tmpDir(outputDir, function () {
    return streamGrammar({
      grammarName: 'Calc',
      inputFile: 'data4.txt',
      outputDir: outputDir,
      startRule: 'prog',
      visitorName: 'EvalVisitor',

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/CalcVisitor.js`)
          .then(() => {
            expect(results.out()).to.match(/42424242/);
          });
      },
    });
  }));
});

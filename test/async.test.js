import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {expectEventuallyFound} from 'stat-again';
import {runGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulp-antlr4 asynchronously', function () {
  this.timeout('10000');

  it(`Running ArrayInit with listener AsyncShortToUnicodeString`,
  tmpDir(outputDir, function () {
    return runGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data3.txt',
      outputDir: outputDir,
      startRule: 'init',
      listenerName: 'AsyncShortToUnicodeString',
      sync: false,

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/ArrayInitListener.js`)
          .then(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                try {
                  expect(results.out()).to.match(/\\u0063\\u0003\\u01c3/);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }, 100);
            });
          });
      },
    });
  }));

  it(`Running Calc with visitor AsyncEvalVisitor`,
  tmpDir(outputDir, function () {
    return runGrammar({
      grammarName: 'Calc',
      inputFile: 'data4.txt',
      outputDir: outputDir,
      startRule: 'prog',
      visitorName: 'AsyncEvalVisitor',
      sync: false,

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/CalcVisitor.js`)
          .then(() => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                try {
                  expect(results.out()).to.match(/42424242/);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              }, 100);
            });
          });
      },
    });
  }));
});

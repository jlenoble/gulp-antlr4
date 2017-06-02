import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {expectEventuallyFound} from 'stat-again';
import {runGrammar, outputDir} from './helpers';
import fs from 'fs';

describe('Testing Gulp plugin gulp-antlr4: Downstream', function () {
  this.timeout('10000');

  it(`Writing to disc (sync translator)`,
  tmpDir(outputDir, function () {
    return runGrammar({
      grammarName: 'ArrayInit',
      inputFile: 'data3.txt',
      outputDir: outputDir,
      startRule: 'init',
      listenerName: 'ShortToUnicodeString',
      dest: outputDir,

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/data3.txt`)
          .then(() => {
            return new Promise((resolve, reject) => {
              fs.readFile(`${outputDir}/data3.txt`, (err, data) => {
                if (err) {
                  return reject(err);
                }

                try {
                  expect(data.toString('utf8')).to.equal(
                    '\\u0063\\u0003\\u01c3');
                  resolve();
                } catch (err) {
                  reject(err);
                }
              });
            });
          });
      },
    });
  }));

  it(`Logging to disc (sync interpreter)`,
  tmpDir(outputDir, function () {
    return runGrammar({
      grammarName: 'Calc',
      inputFile: 'data4.txt',
      outputDir: outputDir,
      startRule: 'prog',
      visitorName: 'EvalVisitor',
      dest: outputDir,

      checkResults (results) {
        return expectEventuallyFound(`${outputDir}/data4.txt`)
          .then(() => {
            return new Promise((resolve, reject) => {
              fs.readFile(`${outputDir}/data4.txt`, (err, data) => {
                if (err) {
                  return reject(err);
                }

                try {
                  expect(data.toString('utf8')).to.equal('42424242\n');
                  resolve();
                } catch (err) {
                  reject(err);
                }
              });
            });
          });
      },
    });
  }));
});

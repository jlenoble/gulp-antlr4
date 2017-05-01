import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {expectEventuallyFound} from 'stat-again';
import {testGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulpAntlr4', function () {
  this.timeout('10000');

  [
    'Hello',
    'ArrayInit',
  ].forEach(grammarName => {
    const checkResults = results => {
      const out = results.out();
      [
        /Requiring external module babel-register/,
        /Working directory changed to/,
        /Using gulpfile/,
        /Starting 'default'.../,
        /Finished 'default' after/,
      ].forEach(pat => {
        expect(out).to.match(pat);
      });
    };

    const onSuccess = () => {
      return Promise.all([
        expectEventuallyFound(`${outputDir}/${grammarName}.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Listener.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Parser.js`),
      ]);
    };

    it(`Testing grammar ${grammarName}`, tmpDir(outputDir, function () {
      return testGrammar({grammarName, checkResults, onSuccess});
    }));
  });
});

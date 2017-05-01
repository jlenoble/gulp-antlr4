import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {expectEventuallyFound} from 'stat-again';
import {testGrammar, runGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulpAntlr4', function () {
  this.timeout('10000');

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

  [
    'Hello',
    'ArrayInit',
  ].forEach(grammarName => {
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

  it(`Running parser ArrayInit`, tmpDir(outputDir, function () {
    return runGrammar({
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

  it(`Running parser ArrayInit`, tmpDir(outputDir, function () {
    return runGrammar({
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
});

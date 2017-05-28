import {expect} from 'chai';
import {tmpDir} from 'cleanup-wrapper';
import {expectEventuallyFound, expectEventuallyDeleted} from 'stat-again';
import {testGrammar, runGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulp-antlr4', function () {
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
        expectEventuallyDeleted(`${outputDir}/${grammarName}Visitor.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Parser.js`),
      ]);
    };

    it(`Testing grammar ${grammarName}: listener`, tmpDir(outputDir,
    function () {
      return testGrammar({grammarName, checkResults, onSuccess});
    }));
  });

  [
    'Hello',
    'ArrayInit',
  ].forEach(grammarName => {
    const onSuccess = () => {
      return Promise.all([
        expectEventuallyFound(`${outputDir}/${grammarName}.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Visitor.js`),
        expectEventuallyDeleted(`${outputDir}/${grammarName}Listener.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Parser.js`),
      ]);
    };

    it(`Testing grammar ${grammarName}: visitor`, tmpDir(outputDir,
    function () {
      return testGrammar({grammarName, checkResults, onSuccess, visitor: true});
    }));
  });

  [
    'Hello',
    'ArrayInit',
  ].forEach(grammarName => {
    const onSuccess = () => {
      return Promise.all([
        expectEventuallyFound(`${outputDir}/${grammarName}.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Visitor.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Listener.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Parser.js`),
      ]);
    };

    it(`Testing grammar ${grammarName}: both`, tmpDir(outputDir,
    function () {
      return testGrammar({grammarName, checkResults, onSuccess, visitor: true,
        listener: true});
    }));
  });

  it(`Running parser ArrayInit on good input`, tmpDir(outputDir, function () {
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

  it(`Running parser ArrayInit on bad input`, tmpDir(outputDir, function () {
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

  it(`Running ArrayInit with listener ShortToUnicodeString`,
  tmpDir(outputDir, function () {
    return runGrammar({
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
    return runGrammar({
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

import {expect} from 'chai';
import {makeSingleTest} from 'child-process-data';
import {expectEventuallyFound} from 'stat-again';

export const outputDir = 'build/antlr4';

export const testGrammar = grammarName => {
  const test = makeSingleTest({
    childProcess: ['gulp', ['--gulpfile',
      'test/gulpfiles/gulpfile.babel.js', `--grammar=${grammarName}`]],

    checkResults (results) {
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
    },

    onSuccess () {
      return Promise.all([
        expectEventuallyFound(`${outputDir}/${grammarName}.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Lexer.tokens`),
        expectEventuallyFound(`${outputDir}/${grammarName}Listener.js`),
        expectEventuallyFound(`${outputDir}/${grammarName}Parser.js`),
      ]);
    },
  });

  return test();
};

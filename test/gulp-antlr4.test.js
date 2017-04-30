import {expect} from 'chai';
import {makeSingleTest} from 'child-process-data';
import {expectEventuallyFound} from 'stat-again';
import {tmpDir} from 'cleanup-wrapper';

describe('Testing Gulp plugin gulpAntlr4', function () {
  this.timeout('10000');
  const outputDir = 'build/antlr4';

  it(`Running gulpfile 'test/gulpfiles/gulpfile.babel.js'`, tmpDir(outputDir,
  function () {
    const test = makeSingleTest({
      childProcess: ['gulp', ['--gulpfile',
        'test/gulpfiles/gulpfile.babel.js']],

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
          expectEventuallyFound(`${outputDir}/Hello.tokens`),
          expectEventuallyFound(`${outputDir}/HelloLexer.js`),
          expectEventuallyFound(`${outputDir}/HelloLexer.tokens`),
          expectEventuallyFound(`${outputDir}/HelloListener.js`),
          expectEventuallyFound(`${outputDir}/HelloParser.js`),
        ]);
      },
    });

    return test();
  }));
});

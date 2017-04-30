import {expect} from 'chai';
import gulpAntlr4 from '../src/gulp-antlr4.js';
import {makeSingleTest} from 'child-process-data';

describe('Testing Gulp plugin gulpAntlr4', function () {
  this.timeout('10000');

  it(`Running gulpfile 'test/gulpfiles/gulpfile.babel.js'`, function () {
    const test = makeSingleTest({
      childProcess: ['gulp', ['--gulpfile', 'test/gulpfiles/gulpfile.babel.js']],

      checkResults (results) {
        expect(results.out()).to.match(
          /Requiring external module babel-register/);
        expect(results.out()).to.match(
          /Working directory changed to/);
        expect(results.out()).to.match(
          /Using gulpfile/);
        expect(results.out()).to.match(
          /Starting 'default'.../);
        expect(results.out()).to.match(
          /Finished 'default' after/);
      },
    });

    return test();
  })
});

import {tmpDir} from 'cleanup-wrapper';
import {testGrammar, outputDir} from './helpers';

describe('Testing Gulp plugin gulpAntlr4', function () {
  this.timeout('10000');

  [
    'Hello',
    'ArrayInit',
  ].forEach(grammarName => {
    it(`Testing grammar ${grammarName}`, tmpDir(outputDir, function () {
      return testGrammar(grammarName);
    }));
  });
});

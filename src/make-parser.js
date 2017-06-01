import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {PluginError} from 'gulp-util';

const PLUGIN_NAME = 'gulp-antlr4';

export default function makeParser (parserDir, mode) {
  const args = makeBaseArgs(parserDir, mode);

  return (grammarFile, callback) => {
    return childProcessData(spawn('java', args.concat(grammarFile.path)))
      .then(() => {
        callback(null, grammarFile);
      }, err => {
        callback(new PluginError(PLUGIN_NAME, err));
      });
  };
}

function makeBaseArgs (parserDir, mode) {
  const args = ['org.antlr.v4.Tool', '-Dlanguage=JavaScript', '-o',
    parserDir];

  if (mode === 'visitor' || mode === 'both') {
    args.push('-visitor');
  }

  if (mode !== 'listener' && mode !== 'both') {
    args.push('-no-listener');
  }

  return args;
}

import {spawn} from 'child_process';
import childProcessData from 'child-process-data';

export default function makeParser (parserDir, mode) {
  const args = makeBaseArgs(parserDir, mode);

  return grammarFile => {
    return childProcessData(spawn('java', args.concat(grammarFile.path)));
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

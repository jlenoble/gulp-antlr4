import {PluginError} from 'gulp-util';
import through from 'through2';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (_outputDir) {
  const outputDir = _outputDir && _outputDir.output || _outputDir;

  if (typeof outputDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`Requires a proper output option`));
  }

  const CLASSPATH = process.env.CLASSPATH;

  if (!CLASSPATH) {
    throw new PluginError(PLUGIN_NAME,
      new ReferenceError(`$CLASSPATH is not defined`));
  }

  const matchJar = CLASSPATH.match(
    /.*:((\d|\w|\/|-|_|\.|\~)+antlr-\d+\.\d+-complete\.jar):.*/);

  if (matchJar === null) {
    throw new PluginError(PLUGIN_NAME,
      new ReferenceError(`Cannot find ANTLR jar file`));
  }

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'Streams not supported!'));
    } else if (file.isBuffer()) {
      childProcessData(spawn('java', ['org.antlr.v4.Tool',
        '-Dlanguage=JavaScript', '-o', outputDir, file.history[0]]))
      .then(() => {
        callback(null, file);
      }, err => {
        this.emit('error', new PluginError(PLUGIN_NAME,
          new Error(err)));
      });
    }
  });
}

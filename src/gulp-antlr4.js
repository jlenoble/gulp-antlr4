import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {InputStream, CommonTokenStream} from 'antlr4';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (_antlrDir) {
  const antlrDir = _antlrDir && _antlrDir.antlrDir || _antlrDir;

  if (typeof antlrDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`You must provide the directory where to write or read
     the generated lexing and parsing tools (option 'antlrDir')`));
  }

  const {grammarName, startRule} = _antlrDir;

  const CLASSPATH = process.env.CLASSPATH;

  if (!CLASSPATH) {
    throw new PluginError(PLUGIN_NAME,
      new ReferenceError(`Environment variable CLASSPATH is not defined`));
  }

  // Not matching '~' as it is not understood by Java anyway
  const matchJar = CLASSPATH.match(
    /.*:((\d|\w|\/|-|_|\.)+antlr-\d+\.\d+-complete\.jar):.*/);

  if (matchJar === null) {
    throw new PluginError(PLUGIN_NAME,
      new ReferenceError(`Cannot find ANTLR 4 .jar file`));
  }

  const ANTLR4 = grammarName ? {
    grammarName, startRule,
    lexerName: `${grammarName}Lexer`,
    parserName: `${grammarName}Parser`,
    isOk (ctx) {
      if (!this.Lexer) {
        ctx.emit('error', new PluginError(PLUGIN_NAME, `Undefined ${
          this.lexerName}`));
        return false;
      }

      if (!this.Parser) {
        ctx.emit('error', new PluginError(PLUGIN_NAME, `Undefined ${
          this.parserName}`));
        return false;
      }

      if (!this.startRule) {
        ctx.emit('error', new PluginError(PLUGIN_NAME,
          `Undefined start rule (option 'rule')`));
        return false;
      }

      return true;
    },
  } : {
    isOk () {
      return false;
    },
  };

  if (grammarName) {
    const {lexerName, parserName} = ANTLR4;
    ANTLR4.Lexer = require(path.join(antlrDir, lexerName))[lexerName];
    ANTLR4.Parser = require(path.join(antlrDir, parserName))[parserName];
  }

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'Streams not supported (yet)!'));
    } else if (file.isBuffer()) {
      const inputFile = file.history[0];

      switch (path.extname(inputFile)) {
      case '.g4':
        return childProcessData(spawn('java', ['org.antlr.v4.Tool',
          '-Dlanguage=JavaScript', '-o', antlrDir, inputFile]))
        .then(() => {
          callback(null, file);
        }, err => {
          this.emit('error', new PluginError(PLUGIN_NAME,
            new Error(err)));
        });

      default:
        if (ANTLR4.isOk(this)) {
          const data = file.contents.toString('utf8');
          const chars = new InputStream(data, true);
          const lexer = new ANTLR4.Lexer(chars);
          const tokens = new CommonTokenStream(lexer);
          const parser = new ANTLR4.Parser(tokens);
          parser.buildParseTrees = true;
          const tree = parser[ANTLR4.startRule]();
        }

        return callback(null, file);
      }
    }
  });
}

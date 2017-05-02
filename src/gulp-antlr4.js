import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (_options) {
  checkJava();

  const options = formatOptions(_options);
  const classDir = getClassDir(options);
  const mode = getMode(options);
  const ANTLR4 = getClasses(options);

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
          '-Dlanguage=JavaScript', '-o', classDir, inputFile]))
        .then(() => {
          callback(null, file);
        }, err => {
          this.emit('error', new PluginError(PLUGIN_NAME,
            new Error(err)));
        });

      default:
        if (ANTLR4.isProperlySetup()) {
          const data = file.contents.toString('utf8');
          const chars = new InputStream(data, true);
          const lexer = new ANTLR4.Lexer(chars);
          const tokens = new CommonTokenStream(lexer);
          const parser = new ANTLR4.Parser(tokens);
          parser.buildParseTrees = true;
          const tree = parser[ANTLR4.rule]();

          switch (mode) {
          case 'tree':
            console.log(tree.toStringTree(parser.ruleNames));
            break;

          case 'walk':
            const walker = new ParseTreeWalker();
            const listener = new ANTLR4.Listener();
            walker.walk(listener, tree);
            console.log('');
            break;
          }
        }

        return callback(null, file);
      }
    }
  });
}

function checkJava () {
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
}

function formatOptions (options) {
  if (typeof options === 'string') {
    return {classDir: options};
  }
  return typeof options === 'object' ? options : {};
}

function getClassDir (options) {
  const {classDir} = options;

  if (typeof classDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`You must provide the directory where to write or read
     the generated lexing and parsing tools (option 'classDir')`));
  }

  return classDir;
}

function getMode (options) {
  const {mode, listener} = options;

  if (typeof mode !== 'string' && mode !== undefined) {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`Bad option: ${mode}`));
  }

  return listener ? 'walk': mode;
}

function getClasses (options) {
  const {grammar} = options;

  if (!grammar) {
    return {
      isProperlySetup () {
        return false;
      },
    };
  }

  return {
    rule: getRule(options),
    Lexer: getLexer(options),
    Parser: getParser(options),
    Listener: getListener(options),
    isProperlySetup () {
      return true;
    },
  };
}

function getRule (options) {
  const {rule} = options;

  if (!rule) {
    throw new PluginError(PLUGIN_NAME,
      `Undefined starting rule (option 'rule')`);
  }

  return rule;
}

function getLexer (options) {
  const {grammar, classDir} = options;
  const lexer = `${grammar}Lexer`;

  return require(path.join(classDir, lexer))[lexer];
}

function getParser (options) {
  const {grammar, classDir} = options;
  const parser = `${grammar}Parser`;

  return require(path.join(classDir, parser))[parser];
}

function getListener (options) {
  const {listener, grammarDir} = options;

  if (!listener) {
    return;
  }

  return require(path.join(grammarDir, listener))[listener];
}

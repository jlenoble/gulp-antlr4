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
  const antlrDir = getANTLRDir(options);
  const antlrMode = getANTLRMode(options);
  const ANTLR4 = getANTLRClasses(options);

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
        if (ANTLR4.isProperlySetup()) {
          const data = file.contents.toString('utf8');
          const chars = new InputStream(data, true);
          const lexer = new ANTLR4.Lexer(chars);
          const tokens = new CommonTokenStream(lexer);
          const parser = new ANTLR4.Parser(tokens);
          parser.buildParseTrees = true;
          const tree = parser[ANTLR4.startRule]();

          switch (antlrMode) {
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
    return {antlrDir: options};
  }
  return typeof options === 'object' ? options : {};
}

function getANTLRDir (options) {
  const {antlrDir} = options;

  if (typeof antlrDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`You must provide the directory where to write or read
     the generated lexing and parsing tools (option 'antlrDir')`));
  }

  return antlrDir;
}

function getANTLRMode (options) {
  const {antlrMode, listenerName} = options;

  if (typeof antlrMode !== 'string' && antlrMode !== undefined) {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`Bad option: ${antlrMode}`));
  }

  return listenerName ? 'walk': antlrMode;
}

function getANTLRClasses (options) {
  const {grammarName} = options;

  if (!grammarName) {
    return {
      isProperlySetup () {
        return false;
      },
    };
  }

  return {
    startRule: getStartRule(options),
    Lexer: getLexer(options),
    Parser: getParser(options),
    Listener: getListener(options),
    isProperlySetup () {
      return true;
    },
  };
}

function getStartRule (options) {
  const {startRule} = options;

  if (!startRule) {
    throw new PluginError(PLUGIN_NAME,
      `Undefined start rule (option 'startRule')`);
  }

  return startRule;
}

function getLexer (options) {
  const {grammarName, antlrDir} = options;
  const lexerName = `${grammarName}Lexer`;

  return require(path.join(antlrDir, lexerName))[lexerName];
}

function getParser (options) {
  const {grammarName, antlrDir} = options;
  const parserName = `${grammarName}Parser`;

  return require(path.join(antlrDir, parserName))[parserName];
}

function getListener (options) {
  const {listenerName, sourcesDir} = options;

  if (!listenerName) {
    return;
  }

  return require(path.join(sourcesDir, listenerName))[listenerName];
}

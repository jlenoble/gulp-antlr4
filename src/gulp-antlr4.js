import toArray from 'stream-to-array';
import {Buffer} from 'buffer';
import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import {spawn} from 'child_process';
import childProcessData from 'child-process-data';
import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';
import checkJava from './check-java';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (_options) {
  checkJava();

  const options = formatOptions(_options);
  const parserDir = getParserDir(options);
  const mode = getMode(options);
  const ANTLR4 = getClasses(options);

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      toArray(file.contents)
        .then(parts => {
          consumeData({
            data: Buffer.concat(parts).toString(encoding),
            ANTLR4, mode,
            ctx: this,
          });
        });
    } else if (file.isBuffer()) {
      const inputFile = file.history[0];

      switch (path.extname(inputFile)) {
      case '.g4':
        const args = ['org.antlr.v4.Tool', '-Dlanguage=JavaScript', '-o',
          parserDir];
        if (mode === 'visitor' || mode === 'both') {
          args.push('-visitor');
        }
        if (mode !== 'listener' && mode !== 'both') {
          args.push('-no-listener');
        }
        args.push(inputFile);
        return childProcessData(spawn('java', args))
        .then(() => {
          callback(null, file);
        }, err => {
          this.emit('error', new PluginError(PLUGIN_NAME, err));
          callback(null, file);
        });

      default:
        if (ANTLR4.isProperlySetup()) {
          consumeData({
            data: file.contents.toString('utf8'),
            ANTLR4, mode,
            ctx: this,
          });
        }
      }
    }
  });
}

function formatOptions (options) {
  if (typeof options === 'string') {
    return {parserDir: options};
  }
  return typeof options === 'object' ? Object.assign({
    listenerDir: options.parserDir, // Default is same dir
    visitorDir: options.parserDir, // Default is same dir
  }, options) : {};
}

function getParserDir (options) {
  const {parserDir} = options;

  if (typeof parserDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`You must provide the directory where to write or read
     the generated lexing and parsing tools (option 'parserDir')`));
  }

  return parserDir;
}

function getMode (options) {
  const {mode, listener, visitor} = options;

  if (typeof mode !== 'string' && mode !== undefined) {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`Bad option: ${mode}`));
  }

  if (listener && visitor) {
    return 'both';
  }

  if (listener) {
    return 'listener';
  }

  if (visitor) {
    return 'visitor';
  }

  return mode || 'listener';
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
    Visitor: getVisitor(options),
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
  const {grammar, parserDir} = options;
  const lexer = `${grammar}Lexer`;

  return requireAfresh(lexer, parserDir);
}

function getParser (options) {
  const {grammar, parserDir} = options;
  const parser = `${grammar}Parser`;

  return requireAfresh(parser, parserDir);
}

function getListener (options) {
  const {listener, listenerDir} = options;

  if (!listener) {
    return;
  }

  return requireAfresh(listener, listenerDir);
}

function getVisitor (options) {
  const {visitor, visitorDir} = options;

  if (!visitor) {
    return;
  }

  return requireAfresh(visitor, visitorDir);
}

function requireAfresh (name, dir) {
  // Convert relative to absolute path
  const base = process.cwd();
  const rel = path.relative(base, dir);
  const file = path.join(base, rel, name);

  // Don't cache parser files
  if (require.cache && require.cache[file]) {
    delete require.cache[file];
  }

  return require(file)[name];
}

function consumeData ({data, ANTLR4, ctx, mode}) {
  const chars = new InputStream(data, true);
  const lexer = new ANTLR4.Lexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ANTLR4.Parser(tokens);
  parser.buildParseTrees = true;
  const tree = parser[ANTLR4.rule]();

  switch (mode) {
  case 'tree':
    console.log(tree.toStringTree(parser.ruleNames));
    return;

  case 'listener':
    new Promise((resolve, reject) => {
      const walker = new ParseTreeWalker();
      const listener = new ANTLR4.Listener(resolve, reject);
      walker.walk(listener, tree);
    }).then(() => {
      ctx.emit('finish');
    }, err => {
      ctx.emit('error', new PluginError(PLUGIN_NAME, err));
    });
    return;

  case 'visitor':
    try {
      const visitor = new ANTLR4.Visitor();

      Promise
        .resolve(visitor.visit(tree))
        .then(() => {
          ctx.emit('finish');
        });

      return; // Don't use callback but rely on above Promise
      // to emit eventually the proper 'finish' event
    } catch (err) {
      ctx.emit('error', new PluginError(PLUGIN_NAME, err));
    }
    break;
  }
}

/* import toArray from 'stream-to-array';
import {Buffer} from 'buffer';*/
import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';
import checkJava from './check-java';
import formatOptions from './format-options';
import makeParser from './make-parser';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (options) {
  checkJava();

  const {parserDir, mode, ANTLR4} = formatOptions(options);
  const dataFiles = [];
  const makeParserFiles = makeParser(parserDir, mode);
  let mustRequireAfresh = false;

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME,
        'Streams are not supported'));
    }

    if (file.isBuffer()) {
      switch (path.extname(file.path).toLowerCase()) {
      case '.g4':
        mustRequireAfresh = true;
        return makeParserFiles(file, callback);

      default:
        dataFiles.push(file);
        return callback(null, file);
      }
    }
  }, function (callback) {
    if (mustRequireAfresh) {
      if (dataFiles.length > 0) {
        callback(new PluginError(PLUGIN_NAME, 'Cannot require afresh yet'));
      } else {
        callback(null);
      }
    } else {
      if (ANTLR4.isProperlySetup()) {
        dataFiles.forEach(file => {
          consumeData({
            data: file.contents.toString('utf8'),
            ANTLR4, mode,
            ctx: this,
          });
        });
      } else {
        callback(new PluginError(PLUGIN_NAME,
          'Options are incomplete or inconsistent'));
      }
    }
  });
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

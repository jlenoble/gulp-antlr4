'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (_options) {
  checkJava();

  var options = formatOptions(_options);
  var parserDir = getParserDir(options);
  var mode = getMode(options);
  var ANTLR4 = getClasses(options);

  return _through2.default.obj(function (file, encoding, callback) {
    var _this = this;

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      (0, _streamToArray2.default)(file.contents).then(function (parts) {
        consumeData({
          data: _buffer.Buffer.concat(parts).toString(encoding),
          ANTLR4: ANTLR4, mode: mode,
          ctx: _this
        });
      });
    } else if (file.isBuffer()) {
      var inputFile = file.history[0];

      switch (_path2.default.extname(inputFile)) {
        case '.g4':
          var args = ['org.antlr.v4.Tool', '-Dlanguage=JavaScript', '-o', parserDir];
          if (mode === 'visitor' || mode === 'both') {
            args.push('-visitor');
          }
          if (mode !== 'listener' && mode !== 'both') {
            args.push('-no-listener');
          }
          args.push(inputFile);
          return (0, _childProcessData2.default)((0, _child_process.spawn)('java', args)).then(function () {
            callback(null, file);
          }, function (err) {
            _this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
            callback(null, file);
          });

        default:
          if (ANTLR4.isProperlySetup()) {
            consumeData({
              data: file.contents.toString('utf8'),
              ANTLR4: ANTLR4, mode: mode,
              ctx: this
            });
          }
      }
    }
  });
};

var _streamToArray = require('stream-to-array');

var _streamToArray2 = _interopRequireDefault(_streamToArray);

var _buffer = require('buffer');

var _gulpUtil = require('gulp-util');

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

var _childProcessData = require('child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

var _antlr = require('antlr4');

var _tree = require('antlr4/tree');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'gulp-antlr4';

function checkJava() {
  var CLASSPATH = process.env.CLASSPATH;

  if (!CLASSPATH) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new ReferenceError('Environment variable CLASSPATH is not defined;\nJava is not installed or is improperly set'));
  }

  // Not matching '~' as it is not understood by Java anyway
  var matchJar = CLASSPATH.match(/.*:((\d|\w|\/|-|_|\.)+antlr-\d+\.\d+-complete\.jar):.*/);

  if (matchJar === null) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new ReferenceError('Cannot find ANTLR4 .jar file;\nIt should appear in your CLASSPATH'));
  }
}

function formatOptions(options) {
  if (typeof options === 'string') {
    return { parserDir: options };
  }
  return (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? Object.assign({
    listenerDir: options.parserDir, // Default is same dir
    visitorDir: options.parserDir }, options) : {};
}

function getParserDir(options) {
  var parserDir = options.parserDir;


  if (typeof parserDir !== 'string') {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new TypeError('You must provide the directory where to write or read\n     the generated lexing and parsing tools (option \'parserDir\')'));
  }

  return parserDir;
}

function getMode(options) {
  var mode = options.mode,
      listener = options.listener,
      visitor = options.visitor;


  if (typeof mode !== 'string' && mode !== undefined) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new TypeError('Bad option: ' + mode));
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

function getClasses(options) {
  var grammar = options.grammar;


  if (!grammar) {
    return {
      isProperlySetup: function isProperlySetup() {
        return false;
      }
    };
  }

  return {
    rule: getRule(options),
    Lexer: getLexer(options),
    Parser: getParser(options),
    Listener: getListener(options),
    Visitor: getVisitor(options),
    isProperlySetup: function isProperlySetup() {
      return true;
    }
  };
}

function getRule(options) {
  var rule = options.rule;


  if (!rule) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, 'Undefined starting rule (option \'rule\')');
  }

  return rule;
}

function getLexer(options) {
  var grammar = options.grammar,
      parserDir = options.parserDir;

  var lexer = grammar + 'Lexer';

  return requireAfresh(lexer, parserDir);
}

function getParser(options) {
  var grammar = options.grammar,
      parserDir = options.parserDir;

  var parser = grammar + 'Parser';

  return requireAfresh(parser, parserDir);
}

function getListener(options) {
  var listener = options.listener,
      listenerDir = options.listenerDir;


  if (!listener) {
    return;
  }

  return requireAfresh(listener, listenerDir);
}

function getVisitor(options) {
  var visitor = options.visitor,
      visitorDir = options.visitorDir;


  if (!visitor) {
    return;
  }

  return requireAfresh(visitor, visitorDir);
}

function requireAfresh(name, dir) {
  // Convert relative to absolute path
  var base = process.cwd();
  var rel = _path2.default.relative(base, dir);
  var file = _path2.default.join(base, rel, name);

  // Don't cache parser files
  if (require.cache && require.cache[file]) {
    delete require.cache[file];
  }

  return require(file)[name];
}

function consumeData(_ref) {
  var data = _ref.data,
      ANTLR4 = _ref.ANTLR4,
      ctx = _ref.ctx,
      mode = _ref.mode;

  var chars = new _antlr.InputStream(data, true);
  var lexer = new ANTLR4.Lexer(chars);
  var tokens = new _antlr.CommonTokenStream(lexer);
  var parser = new ANTLR4.Parser(tokens);
  parser.buildParseTrees = true;
  var tree = parser[ANTLR4.rule]();

  switch (mode) {
    case 'tree':
      console.log(tree.toStringTree(parser.ruleNames));
      return;

    case 'listener':
      new Promise(function (resolve, reject) {
        var walker = new _tree.ParseTreeWalker();
        var listener = new ANTLR4.Listener(resolve, reject);
        walker.walk(listener, tree);
      }).then(function () {
        ctx.emit('finish');
      }, function (err) {
        ctx.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
      });
      return;

    case 'visitor':
      try {
        var visitor = new ANTLR4.Visitor();

        Promise.resolve(visitor.visit(tree)).then(function () {
          ctx.emit('finish');
        });

        return; // Don't use callback but rely on above Promise
        // to emit eventually the proper 'finish' event
      } catch (err) {
        ctx.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
      }
      break;
  }
}
module.exports = exports['default'];
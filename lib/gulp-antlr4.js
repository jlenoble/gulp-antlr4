'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = function (_options) {
  checkJava();

  var options = formatOptions(_options);
  var parserDir = getClassDir(options);
  var mode = getMode(options);
  var ANTLR4 = getClasses(options);

  return _through2.default.obj(function (file, encoding, callback) {
    var _this = this;

    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, 'Streams not supported (yet)!'));
    } else if (file.isBuffer()) {
      var inputFile = file.history[0];

      switch (_path2.default.extname(inputFile)) {
        case '.g4':
          return (0, _childProcessData2.default)((0, _child_process.spawn)('java', ['org.antlr.v4.Tool', '-Dlanguage=JavaScript', '-o', parserDir, inputFile])).then(function () {
            callback(null, file);
          }, function (err) {
            _this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, new Error(err)));
          });

        default:
          if (ANTLR4.isProperlySetup()) {
            var data = file.contents.toString('utf8');
            var chars = new _antlr.InputStream(data, true);
            var lexer = new ANTLR4.Lexer(chars);
            var tokens = new _antlr.CommonTokenStream(lexer);
            var parser = new ANTLR4.Parser(tokens);
            parser.buildParseTrees = true;
            var tree = parser[ANTLR4.rule]();

            switch (mode) {
              case 'tree':
                console.log(tree.toStringTree(parser.ruleNames));
                break;

              case 'walk':
                var walker = new _tree.ParseTreeWalker();
                var listener = new ANTLR4.Listener();
                walker.walk(listener, tree);
                console.log('');
                break;
            }
          }

          return callback(null, file);
      }
    }
  });
};

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
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new ReferenceError('Environment variable CLASSPATH is not defined'));
  }

  // Not matching '~' as it is not understood by Java anyway
  var matchJar = CLASSPATH.match(/.*:((\d|\w|\/|-|_|\.)+antlr-\d+\.\d+-complete\.jar):.*/);

  if (matchJar === null) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new ReferenceError('Cannot find ANTLR 4 .jar file'));
  }
}

function formatOptions(options) {
  if (typeof options === 'string') {
    return { parserDir: options };
  }
  return (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? Object.assign({
    listenerDir: options.parserDir }, options) : {};
}

function getClassDir(options) {
  var parserDir = options.parserDir;


  if (typeof parserDir !== 'string') {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new TypeError('You must provide the directory where to write or read\n     the generated lexing and parsing tools (option \'parserDir\')'));
  }

  return parserDir;
}

function getMode(options) {
  var mode = options.mode,
      listener = options.listener;


  if (typeof mode !== 'string' && mode !== undefined) {
    throw new _gulpUtil.PluginError(PLUGIN_NAME, new TypeError('Bad option: ' + mode));
  }

  return listener ? 'walk' : mode;
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

  // Convert relative to absolute path
  var base = process.cwd();
  var rel = _path2.default.relative(base, parserDir);
  return require(_path2.default.join(base, rel, lexer))[lexer];
}

function getParser(options) {
  var grammar = options.grammar,
      parserDir = options.parserDir;

  var parser = grammar + 'Parser';

  // Convert relative to absolute path
  var base = process.cwd();
  var rel = _path2.default.relative(base, parserDir);
  return require(_path2.default.join(base, rel, parser))[parser];
}

function getListener(options) {
  var listener = options.listener,
      listenerDir = options.listenerDir;


  if (!listener) {
    return;
  }

  // Convert relative to absolute path
  var base = process.cwd();
  var rel = _path2.default.relative(base, listenerDir);
  return require(_path2.default.join(base, rel, listener))[listener];
}
module.exports = exports['default'];
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = formatOptions;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'gulp-antlr4';

function formatOptions(options) {
  var opts = void 0;

  if (typeof options === 'string') {
    opts = { parserDir: options };
  } else {
    opts = (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' ? Object.assign({
      listenerDir: options.parserDir, // Default is same dir
      visitorDir: options.parserDir }, options) : {};
  }

  var parserDir = getParserDir(opts);
  var mode = getMode(opts);
  var ANTLR4 = getClasses(opts);
  var sync = opts.sync === undefined ? true : !!opts.sync;

  return { parserDir: parserDir, mode: mode, ANTLR4: ANTLR4, sync: sync };
}

function getParserDir(options) {
  var parserDir = options.parserDir;


  if (typeof parserDir !== 'string') {
    throw new PluginError(PLUGIN_NAME, new TypeError('You must provide the directory where to write or read\n     the generated lexing and parsing tools (option \'parserDir\')'));
  }

  return parserDir;
}

function getMode(options) {
  var mode = options.mode,
      listener = options.listener,
      visitor = options.visitor;


  if (typeof mode !== 'string' && mode !== undefined) {
    throw new PluginError(PLUGIN_NAME, new TypeError('Bad option: ' + mode));
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
      return this.Lexer && typeof this.Lexer === 'function';
    },

    requireAfresh: getClasses.bind(null, options)
  };
}

function getRule(options) {
  var rule = options.rule;


  if (!rule) {
    throw new PluginError(PLUGIN_NAME, 'Undefined starting rule (option \'rule\')');
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

  try {
    return require(file)[name];
  } catch (err) {
    // Simply postpone requirement, hoping for some grammar in stream
  }
}
module.exports = exports['default'];
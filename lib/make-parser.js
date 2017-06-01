'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeParser;

var _child_process = require('child_process');

var _childProcessData = require('child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

var _gulpUtil = require('gulp-util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'gulp-antlr4';

function makeParser(parserDir, mode) {
  var args = makeBaseArgs(parserDir, mode);

  return function (grammarFile, callback) {
    return (0, _childProcessData2.default)((0, _child_process.spawn)('java', args.concat(grammarFile.path))).then(function () {
      callback(null, grammarFile);
    }, function (err) {
      callback(new _gulpUtil.PluginError(PLUGIN_NAME, err));
    });
  };
}

function makeBaseArgs(parserDir, mode) {
  var args = ['org.antlr.v4.Tool', '-Dlanguage=JavaScript', '-o', parserDir];

  if (mode === 'visitor' || mode === 'both') {
    args.push('-visitor');
  }

  if (mode !== 'listener' && mode !== 'both') {
    args.push('-no-listener');
  }

  return args;
}
module.exports = exports['default'];
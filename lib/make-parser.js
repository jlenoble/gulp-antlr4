'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeParser;

var _child_process = require('child_process');

var _childProcessData = require('child-process-data');

var _childProcessData2 = _interopRequireDefault(_childProcessData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeParser(parserDir, mode) {
  var args = makeBaseArgs(parserDir, mode);

  return function (grammarFile) {
    return (0, _childProcessData2.default)((0, _child_process.spawn)('java', args.concat(grammarFile.path)));
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
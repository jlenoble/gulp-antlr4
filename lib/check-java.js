'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkJava;

var _gulpUtil = require('gulp-util');

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
module.exports = exports['default'];
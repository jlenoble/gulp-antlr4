"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = checkJava;
function checkJava() {
  var CLASSPATH = process.env.CLASSPATH;

  if (!CLASSPATH) {
    throw new ReferenceError("Environment variable CLASSPATH is not defined;\nJava is not installed or is improperly set");
  }

  // Not matching '~' as it is not understood by Java anyway
  var matchJar = CLASSPATH.match(/.*:((\d|\w|\/|-|_|\.)+antlr-\d+\.\d+-complete\.jar):.*/);

  if (matchJar === null) {
    throw new ReferenceError("Cannot find ANTLR4 .jar file;\nIt should appear in your CLASSPATH");
  }
}
module.exports = exports["default"];
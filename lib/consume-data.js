'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = consumeData;

var _antlr = require('antlr4');

var _tree = require('antlr4/tree');

function consumeData(_ref) {
  var data = _ref.data,
      ANTLR4 = _ref.ANTLR4,
      mode = _ref.mode,
      sync = _ref.sync;

  var _buildTree = buildTree(data, ANTLR4),
      tree = _buildTree.tree,
      parser = _buildTree.parser;

  switch (mode) {
    case 'tree':
      return handleTree(tree, parser);

    case 'listener':
      return handleListener(tree, ANTLR4, sync);

    case 'visitor':
      return handleVisitor(tree, ANTLR4);
  }
}

function buildTree(data, ANTLR4) {
  var chars = new _antlr.InputStream(data, true);
  var lexer = new ANTLR4.Lexer(chars);
  var tokens = new _antlr.CommonTokenStream(lexer);
  var parser = new ANTLR4.Parser(tokens);
  parser.buildParseTrees = true;
  var tree = parser[ANTLR4.rule]();

  return { tree: tree, parser: parser };
}

function handleTree(tree, parser) {
  console.log(tree.toStringTree(parser.ruleNames));
}

function handleListener(tree, ANTLR4) {
  var sync = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var walker = new _tree.ParseTreeWalker();
  var listener = new ANTLR4.Listener();

  if (sync) {
    walker.walk(listener, tree);
  } else {
    // Name for last method to be walked
    var exitRule = 'exit' + ANTLR4.rule[0].toUpperCase() + ANTLR4.rule.slice(1);

    // Return a promise that'll wait for walker to finish walking
    return new Promise(function (resolve, reject) {
      // Cache last method to be walked
      var exitFunc = listener[exitRule].bind(listener);

      // Resolve only after last walked method has returned
      listener[exitRule] = function (ctx) {
        try {
          var result = exitFunc(ctx);

          if (result !== undefined && result.then) {
            result.then(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (err) {
          reject(err);
        }
      };

      walker.walk(listener, tree);
    });
  }
}

function handleVisitor(tree, ANTLR4) {
  var visitor = new ANTLR4.Visitor();
  return visitor.visit(tree);
}
module.exports = exports['default'];
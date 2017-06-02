import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';

export default function consumeData ({data, ANTLR4, mode, sync}) {
  const {tree, parser} = buildTree(data, ANTLR4);

  switch (mode) {
  case 'tree':
    return handleTree(tree, parser);

  case 'listener':
    return handleListener(tree, ANTLR4, sync);

  case 'visitor':
    return handleVisitor(tree, ANTLR4);
  }
}

function buildTree (data, ANTLR4) {
  const chars = new InputStream(data, true);
  const lexer = new ANTLR4.Lexer(chars);
  const tokens = new CommonTokenStream(lexer);
  const parser = new ANTLR4.Parser(tokens);
  parser.buildParseTrees = true;
  const tree = parser[ANTLR4.rule]();

  return {tree, parser};
}

function handleTree (tree, parser) {
  console.log(tree.toStringTree(parser.ruleNames));
}

function handleListener (tree, ANTLR4, sync = true) {
  const walker = new ParseTreeWalker();
  const listener = new ANTLR4.Listener();

  if (sync) {
    walker.walk(listener, tree);
  } else {
    // Name for last method to be walked
    const exitRule = 'exit' + ANTLR4.rule[0].toUpperCase() +
      ANTLR4.rule.slice(1);

    // Return a promise that'll wait for walker to finish walking
    return new Promise((resolve, reject) => {
      // Cache last method to be walked
      const exitFunc = listener[exitRule].bind(listener);

      // Resolve only after last walked method has returned
      listener[exitRule] = function (ctx) {
        try {
          const result = exitFunc(ctx);

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

function handleVisitor (tree, ANTLR4) {
  const visitor = new ANTLR4.Visitor();
  return visitor.visit(tree);
}

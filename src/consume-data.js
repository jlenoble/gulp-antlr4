import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';

export default function consumeData ({data, ANTLR4, mode}) {
  const {tree, parser} = buildTree(data, ANTLR4);

  switch (mode) {
  case 'tree':
    return handleTree(tree, parser);

  case 'listener':
    return handleListener(tree, ANTLR4);

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

function handleListener (tree, ANTLR4) {
  const walker = new ParseTreeWalker();
  const listener = new ANTLR4.Listener();
  walker.walk(listener, tree);
  return listener;
}

function handleVisitor (tree, ANTLR4) {
  const visitor = new ANTLR4.Visitor();
  return visitor.visit(tree);
}

import {PluginError} from 'gulp-util';
import {InputStream, CommonTokenStream} from 'antlr4';
import {ParseTreeWalker} from 'antlr4/tree';

const PLUGIN_NAME = 'gulp-antlr4';

export default function consumeData ({data, ANTLR4, ctx, mode}) {
  const {tree, parser} = buildTree(data, ANTLR4);

  switch (mode) {
  case 'tree':
    console.log(tree.toStringTree(parser.ruleNames));
    return;

  case 'listener':
    new Promise((resolve, reject) => {
      const walker = new ParseTreeWalker();
      const listener = new ANTLR4.Listener(resolve, reject);
      walker.walk(listener, tree);
    }).then(() => {
      ctx.emit('finish');
    }, err => {
      ctx.emit('error', new PluginError(PLUGIN_NAME, err));
    });
    return;

  case 'visitor':
    try {
      const visitor = new ANTLR4.Visitor();

      Promise
        .resolve(visitor.visit(tree))
        .then(() => {
          ctx.emit('finish');
        });

      return; // Don't use callback but rely on above Promise
      // to emit eventually the proper 'finish' event
    } catch (err) {
      ctx.emit('error', new PluginError(PLUGIN_NAME, err));
    }
    break;
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

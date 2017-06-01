import path from 'path';

const {ArrayInitListener} = require(path.join('../../antlr4',
  'ArrayInitListener'));

export class AsyncShortToUnicodeString extends ArrayInitListener {
  enterInit () {
    process.stdout.write('');
  }

  exitInit () {
    process.stdout.write('');
  }

  enterValue (ctx) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const value = '0000' + parseInt(ctx.INT().getText(), 10).toString(16);
          process.stdout.write('\\u' + value.slice(-4));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  visitProg (ctx) {
    return ctx.children.reduce((promise, child) => {
      return promise.then(() => this.visit(child));
    }, Promise.resolve());
  }
}

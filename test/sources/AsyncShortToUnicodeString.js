import path from 'path';

const {ArrayInitListener} = require(path.join('../../antlr4',
  'ArrayInitListener'));

export class AsyncShortToUnicodeString extends ArrayInitListener {
  enterInit () {
    process.stdout.write('');
  }

  exitInit () {
    process.stdout.write('');

    return new Promise((resolve, reject) => {
      setTimeout(resolve, 30);
    });
  }

  enterValue (ctx) {
    // eslint-disable-next-line new-cap
    const value = '0000' + parseInt(ctx.INT().getText(), 10).toString(16);
    process.stdout.write('\\u' + value.slice(-4));
  }
}

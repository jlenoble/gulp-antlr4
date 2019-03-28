import path from 'path';

const {ArrayInitListener} = require(path.join('../../antlr4',
  'ArrayInitListener'));

export class ShortToUnicodeString extends ArrayInitListener {
  enterInit () {
    process.stdout.write('');
  }

  exitInit () {
    process.stdout.write('');
  }

  enterValue (ctx) {
    // eslint-disable-next-line new-cap
    const value = '0000' + parseInt(ctx.INT().getText(), 10).toString(16);
    process.stdout.write('\\u' + value.slice(-4));
  }
}

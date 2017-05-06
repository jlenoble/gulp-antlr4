import path from 'path';

const {CalcVisitor} = require(path.join('../../antlr4', 'CalcVisitor'));
const {CalcParser} = require(path.join('../../antlr4', 'CalcParser'));

export class EvalVisitor extends CalcVisitor {
  constructor (...args) {
    super(...args);
    this.variables = {};
  }

  visitAssign (ctx) {
    const id = ctx.ID().getText();
    const value = this.visit(ctx.expr());
    this.variables[id] = value;
    return value;
  }

  visitPrintExpr (ctx) {
    const value = this.visit(ctx.expr());
    console.log(value);
    return 0;
  }

  visitInt (ctx) {
    return parseInt(ctx.INT().getText(), 10);
  }

  visitId (ctx) {
    const id = ctx.ID().getText();
    if (this.variables[id]) {
      return this.variables[id];
    }
    return 0;
  }

  visitMulDiv (ctx) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    if (ctx.op.type === CalcParser.MUL) {
      return left * right;
    }
    return left / right;
  }

  visitAddSub (ctx) {
    const left = this.visit(ctx.expr(0));
    const right = this.visit(ctx.expr(1));
    if (ctx.op.type === CalcParser.ADD) {
      return left + right;
    }
    return left - right;
  }

  visitParens (ctx) {
    return this.visit(ctx.expr());
  }
}

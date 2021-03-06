import path from 'path';

const {CalcVisitor} = require(path.join('../../antlr4', 'CalcVisitor'));
const {CalcParser} = require(path.join('../../antlr4', 'CalcParser'));

export class AsyncEvalVisitor extends CalcVisitor {
  constructor (...args) {
    super(...args);
    this.variables = {};
  }

  visitAssign (ctx) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const id = ctx.ID().getText(); // eslint-disable-line new-cap
          const value = this.visit(ctx.expr());
          this.variables[id] = value;
          resolve(value);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  visitPrintExpr (ctx) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const value = this.visit(ctx.expr());
          console.log(value);
          resolve(0);
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  visitInt (ctx) {
    return parseInt(ctx.INT().getText(), 10); // eslint-disable-line new-cap
  }

  visitId (ctx) {
    const id = ctx.ID().getText(); // eslint-disable-line new-cap
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

  visitProg (ctx) {
    return ctx.children.reduce((promise, child) => {
      return promise.then(() => this.visit(child));
    }, Promise.resolve());
  }
}

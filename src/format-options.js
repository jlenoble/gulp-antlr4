import path from 'path';

const PLUGIN_NAME = 'gulp-antlr4';

export default function formatOptions (options) {
  let opts;

  if (typeof options === 'string') {
    opts = {parserDir: options};
  } else {
    opts = typeof options === 'object' ? Object.assign({
      listenerDir: options.parserDir, // Default is same dir
      visitorDir: options.parserDir, // Default is same dir
    }, options) : {};
  }

  const parserDir = getParserDir(opts);
  const mode = getMode(opts);
  const ANTLR4 = getClasses(opts);
  const sync = opts.sync === true || true;

  return {parserDir, mode, ANTLR4, sync};
}

function getParserDir (options) {
  const {parserDir} = options;

  if (typeof parserDir !== 'string') {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`You must provide the directory where to write or read
     the generated lexing and parsing tools (option 'parserDir')`));
  }

  return parserDir;
}

function getMode (options) {
  const {mode, listener, visitor} = options;

  if (typeof mode !== 'string' && mode !== undefined) {
    throw new PluginError(PLUGIN_NAME,
      new TypeError(`Bad option: ${mode}`));
  }

  if (listener && visitor) {
    return 'both';
  }

  if (listener) {
    return 'listener';
  }

  if (visitor) {
    return 'visitor';
  }

  return mode || 'listener';
}

function getClasses (options) {
  const {grammar} = options;

  if (!grammar) {
    return {
      isProperlySetup () {
        return false;
      },
    };
  }

  return {
    rule: getRule(options),
    Lexer: getLexer(options),
    Parser: getParser(options),
    Listener: getListener(options),
    Visitor: getVisitor(options),
    isProperlySetup () {
      return true;
    },
  };
}

function getRule (options) {
  const {rule} = options;

  if (!rule) {
    throw new PluginError(PLUGIN_NAME,
      `Undefined starting rule (option 'rule')`);
  }

  return rule;
}

function getLexer (options) {
  const {grammar, parserDir} = options;
  const lexer = `${grammar}Lexer`;

  return requireAfresh(lexer, parserDir);
}

function getParser (options) {
  const {grammar, parserDir} = options;
  const parser = `${grammar}Parser`;

  return requireAfresh(parser, parserDir);
}

function getListener (options) {
  const {listener, listenerDir} = options;

  if (!listener) {
    return;
  }

  return requireAfresh(listener, listenerDir);
}

function getVisitor (options) {
  const {visitor, visitorDir} = options;

  if (!visitor) {
    return;
  }

  return requireAfresh(visitor, visitorDir);
}

function requireAfresh (name, dir) {
  // Convert relative to absolute path
  const base = process.cwd();
  const rel = path.relative(base, dir);
  const file = path.join(base, rel, name);

  // Don't cache parser files
  if (require.cache && require.cache[file]) {
    delete require.cache[file];
  }

  return require(file)[name];
}

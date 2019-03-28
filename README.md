# gulp-antlr4

Gulp plugin running ANTLR 4

  * [Background](#background)
  * [Usage](#usage)
    * [Generating a listener parser](#generating-a-listener-parser)
    * [Generating a visitor parser](#generating-a-visitor-parser)
    * [Using a listener parser](#using-a-listener-parser)
    * [Using a visitor parser](#using-a-visitor-parser)
  * [Real life Gulpfile example](#real-life-gulpfile-example)
  * [License](#license)


## Background

First you should get familiar with [ANTLR4](http://www.antlr.org/) and how to write grammars. This plugin won't save you from getting fluent with that powerhouse of a tool.

But once you've done that, you will be able to make excitingly complex transforms of your files.

ANTLR4 comes with a [Javascript runtime](https://github.com/antlr/antlr4/tree/master/runtime/JavaScript), but the documentation on the web is almost exclusively in a JAVA context. This Gulp plugin aims at eliminating all frictions in the Javascript context between your grammars and your intents.

The normal Gulp way is to source your data files and get downstream your translations or your interpretations. Just point the plugin to your custom translator or your custom visitor and it will do the rest.

But the plugin can also recognize your grammar files and generate for you the base parser/lexer files from which you will derive your translator/visitor. You need for that [Java installed](https://www.java.com/fr/download/) and the [ANTLR4 Jar installed](https://github.com/antlr/antlr4/blob/master/doc/getting-started.md). The plugin will refuse to work if your environment is not properly set up, since if you can't generate anew from your updated grammars, you can't develop any ANTLR4 application anyway.

## Usage

### Generating a listener parser

Convenience usage, but not the Gulp way. See [Using a listener parser](#using-a-listener-parser) for the Gulp way.

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('generate-my-listener-files', () => {
  return gulp.src('path/to/MyGrammar.g4') // Relies on .g4 extension!
    .pipe(antlr4('output-dir'));// Where to put the generated Parser files
}); // Streams down the unchanged grammars
```

### Generating a visitor parser

Convenience usage, but not the Gulp way. See [Using a visitor parser](#using-a-visitor-parser) for the Gulp way.

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('generate-my-visitor-files', () => {
  return gulp.src('path/to/MyGrammar.g4') // Relies on .g4 extension!
    .pipe(antlr4({
      parserDir: 'output-dir', // Where to put the generated Parser files
      visitor: true,
    })); // Streams down the unchanged grammars
});
```

### Using a listener parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('translate-my-files', () => {
  return gulp.src('data-glob/**/*') // If the glob contains .g4 files,
  // they will be processed first and the data files buffered, then the new
  // generated translator will process them
    .pipe(antlr4({
      grammar: 'MyGrammar', // Stem for all the generated Parser file names
      parserDir: 'some-dir', // Where to find/put the generated Parser files
      listener: 'MyListener', // Your custom child of MyGrammarListener
      listenerDir: 'another-dir', // Where to find the above; may be
        // omitted if it is the same as parserDir
      rule: 'init', // Starting rule for parsing data files
    })); // Streams down the translated data files
});
```

### Using a visitor parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('interprete-my-files', () => {
  return gulp.src('data-glob/**/*') // If the glob contains .g4 files,
  // they will be processed first and the data files buffered, then the new
  // generated interpreter will process them
    .pipe(antlr4({
      grammar: 'MyGrammar', // Stem for all the generated Parser file names
      parserDir: 'some-dir', // Where to find/put the generated Parser files
      visitor: 'MyVisitor', // Your custom child of MyGrammarVisitor
      visitorDir: 'another-dir', // Where to find the above; may be
        // omitted if it is the same as parserDir
      rule: 'init', // Starting rule for parsing data files
    })); // Streams down the interpretation of the data files, e.g. the results
    // of a series of arithmetical operations if your interpreter is a
    // calculator of some sort
});
```

## Real life Gulpfile example

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

const grammarGlob = [
  'src/static/antlr4/grammars/**/*.g4'
];
const parserDir = 'src/static/antlr4/parsers';
const dataGlob = [
  'src/static/data/**/*.*'
];
const grammar = 'Calc';
const rule = 'prog';
const listener = 'Translator';
const listenerDir = 'build/src/static/antlr4/custom';
const visitor = 'Interpreter';
const visitorDir = 'build/src/static/antlr4/custom';
const outputDir = 'src/static/results';

export const makeParser = () => {
  if (require && require.cache) {
    // Remove parser files from require cache
    Object.keys(require.cache).filter(key => {
      return key.includes(parserDir) ||
        key.includes(listenerDir) ||
        key.includes(visitorDir);
    }).forEach(key => {
      delete require.cache[key];
    });
  }

  return gulp.src(grammarGlob)
    .pipe(antlr4({
      parserDir,
      listener: true,
      visitor: true
    }));
};

export const translate = () => {
  return gulp.src(dataGlob)
    .pipe(antlr4({
      grammar, parserDir, listener, listenerDir, rule,
    }))
    .pipe(gulp.dest(outputDir));
};

gulp.task('translate', gulp.series(makeParser, translate));

export const calculate = () => {
  return gulp.src(dataGlob)
    .pipe(antlr4({
      grammar, parserDir, visitor, visitorDir, rule,
    }))
    .pipe(gulp.dest(outputDir));
};

gulp.task('calculate', gulp.series(makeParser, calculate));
```


## License

gulp-antlr4 is [MIT licensed](./LICENSE).

© 2017-2019 [Jason Lenoble](mailto:jason.lenoble@gmail.com)


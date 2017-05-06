# gulp-antlr4

Gulp plugin running ANTLR 4

  * [Usage](#usage)
    * [Generating a listener parser](#generating-a-listener-parser)
    * [Generating a visitor parser](#generating-a-visitor-parser)
    * [Using a listener parser](#using-a-listener-parser)
    * [Using a visitor parser](#using-a-visitor-parser)
  * [License](#license)


## Usage

### Generating a listener parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('generate-parser-files', () => {
  return gulp.src('path/to/MyGrammar.g4') // Relies on .g4 extension!
    .pipe(antlr4('output-dir'));// Where to put the generated Parser files
});
```

### Generating a visitor parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('generate-parser-files', () => {
  return gulp.src('path/to/MyGrammar.g4') // Relies on .g4 extension!
    .pipe(antlr4({
      parserDir: 'output-dir', // Where to put the generated Parser files
      visitor: true,
    }));
});
```

### Using a listener parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('use-parser-files', () => {
  return gulp.src('data-glob/**/*') // No .g4 files in glob!
    .pipe(antlr4({
      grammar: 'MyGrammar', // Stem for all the generated file names
      parserDir: 'some-dir', // Where to find the generated Parser files
      listener: 'MyListener', // Custom child of the generated MyGrammarListener
      listenerDir: 'another-dir', // Where to find the above; may be
        // omitted if it is the same as parserDir
      rule: 'init', // Starting rule
    }));
});
```

### Using a visitor parser

```js
import gulp from 'gulp';
import antlr4 from 'gulp-antlr4';

gulp.task('use-parser-files', () => {
  return gulp.src('data-glob/**/*') // No .g4 files in glob!
    .pipe(antlr4({
      grammar: 'MyGrammar', // Stem for all the generated file names
      parserDir: 'some-dir', // Where to find the generated Parser files
      visitor: 'MyVisitor', // Custom child of the generated MyGrammarVisitor
      visitorDir: 'another-dir', // Where to find the above; may be
        // omitted if it is the same as parserDir
      rule: 'init', // Starting rule
    }));
});
```

## License

gulp-antlr4 is [MIT licensed](./LICENSE).

© 2017 [Jason Lenoble](mailto:jason.lenoble@gmail.com)

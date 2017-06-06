import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import Muter, {captured} from 'muter';
import checkJava from './check-java';
import formatOptions from './format-options';
import makeParser from './make-parser';
import consumeData from './consume-data';

const PLUGIN_NAME = 'gulp-antlr4';

export default function (options) {
  checkJava();

  const {parserDir, mode, ANTLR4, sync} = formatOptions(options);
  const dataFiles = [];
  const makeParserFiles = makeParser(parserDir, mode);
  let mustRequireAfresh = !ANTLR4.isProperlySetup();

  return through.obj(function (file, encoding, done) {
    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'Streams are not supported'));
      return done();
    }

    if (file.isBuffer()) {
      if (path.extname(file.path).toLowerCase() === '.g4') {
        mustRequireAfresh = true;
        return makeParserFiles(file).then(() => {
          done(null, file);
        }, err => {
          this.emit('error', new PluginError(PLUGIN_NAME, err));
          done();
        });
      } else {
        dataFiles.push(file);
        return done();
      }
    }
  }, function (done) {
    let refreshedANTLR4 = ANTLR4;

    if (mustRequireAfresh) {
      // Grammars were in stream, update ANTLR4 if needed
      if (dataFiles.length > 0) {
        refreshedANTLR4 = ANTLR4.requireAfresh();
      } else {
        // No data files, just already processed grammars, so return
        return done(null);
      }
    }

    if (refreshedANTLR4.isProperlySetup()) {
      if (sync) {
        const muter = Muter(process.stdout, 'write');

        const consumeFile = captured(muter, file => {
          try {
            consumeData({
              data: file.contents.toString('utf8'),
              ANTLR4: refreshedANTLR4,
              mode, sync,
            });

            file.contents = new Buffer(muter.getLogs()); // eslint-disable-line
            muter.forget();

            this.push(file);
          } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err));
            done();
          }
        });

        dataFiles.forEach(consumeFile);

        done(null);
      } else {
        const muter = Muter(process.stdout, 'write');

        const consumeFile = captured(muter, file => {
          return consumeData({
            data: file.contents.toString('utf8'),
            ANTLR4: refreshedANTLR4,
            mode, sync,
          }).then(() => {
            file.contents = new Buffer(muter.getLogs()); // eslint-disable-line
            muter.forget();

            this.push(file);
          }, err => {
            this.emit('error', new PluginError(PLUGIN_NAME, err));
            done();
          });
        });

        dataFiles.reduce((promise, file) => {
          return promise.then(
            () => consumeFile(file),
            err => done(err)
          );
        }, Promise.resolve()).then(() => {
          done(null);
        }, err => {
          this.emit('error', new PluginError(PLUGIN_NAME, err));
          done();
        });
      }
    } else {
      this.emit('error',
        new PluginError(PLUGIN_NAME, refreshedANTLR4.getError() ||
          'Options are incomplete or inconsistent'));
      done();
    }
  });
}

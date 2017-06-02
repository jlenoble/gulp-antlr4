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

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME,
        'Streams are not supported'));
    }

    if (file.isBuffer()) {
      if (path.extname(file.path).toLowerCase() === '.g4') {
        mustRequireAfresh = true;
        return makeParserFiles(file, callback);
      } else {
        dataFiles.push(file);
        return callback(null);
      }
    }
  }, function (callback) {
    let refreshedANTLR4 = ANTLR4;

    if (mustRequireAfresh) {
      // Grammars were in stream, update ANTLR4 if needed
      if (dataFiles.length > 0) {
        refreshedANTLR4 = ANTLR4.requireAfresh();
      } else {
        // No data files, just already processed grammars, so return
        return callback(null);
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
              mode,
            });

            file.contents = new Buffer(muter.getLogs()); // eslint-disable-line
            muter.forget();

            this.push(file);
          } catch (err) {
            callback(new PluginError(PLUGIN_NAME, err));
          }
        });

        dataFiles.forEach(consumeFile);

        callback(null);
      } else {
        dataFiles.reduce((promise, file) => {
          return promise.then(() => consumeData({
            data: file.contents.toString('utf8'),
            ANTLR4: refreshedANTLR4,
            mode,
          }).then(() => {
            this.push(file);
          }), err => {
            callback(new PluginError(PLUGIN_NAME, err));
          });
        }, Promise.resolve()).then(() => {
          callback(null);
        }, err => {
          callback(new PluginError(PLUGIN_NAME, err));
        });
      }
    } else {
      callback(new PluginError(PLUGIN_NAME,
        'Options are incomplete or inconsistent'));
    }
  });
}

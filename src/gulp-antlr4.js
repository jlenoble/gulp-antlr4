import {PluginError} from 'gulp-util';
import through from 'through2';
import path from 'path';
import checkJava from './check-java';
import formatOptions from './format-options';
import makeParser from './make-parser';
import consumeData from './consume-data';

export default function (options) {
  checkJava();

  const {parserDir, mode, ANTLR4} = formatOptions(options);
  const dataFiles = [];
  const makeParserFiles = makeParser(parserDir, mode);
  let mustRequireAfresh = false;

  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(PLUGIN_NAME,
        'Streams are not supported'));
    }

    if (file.isBuffer()) {
      switch (path.extname(file.path).toLowerCase()) {
      case '.g4':
        mustRequireAfresh = true;
        return makeParserFiles(file, callback);

      default:
        dataFiles.push(file);
        return callback(null, file);
      }
    }
  }, function (callback) {
    if (mustRequireAfresh) {
      if (dataFiles.length > 0) {
        callback(new PluginError(PLUGIN_NAME, 'Cannot require afresh yet'));
      } else {
        callback(null);
      }
    } else {
      if (ANTLR4.isProperlySetup()) {
        dataFiles.forEach(file => {
          consumeData({
            data: file.contents.toString('utf8'),
            ANTLR4, mode,
            ctx: this,
          });
        });
      } else {
        callback(new PluginError(PLUGIN_NAME,
          'Options are incomplete or inconsistent'));
      }
    }
  });
}

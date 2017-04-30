import {PluginError} from 'gulp-util';
import through from 'through2';

const PLUGIN_NAME = 'gulp-antlr4';

export default function () {
  return through.obj(function(file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'Streams not supported!'));
    } else if (file.isBuffer()) {
      this.emit('error', new PluginError(PLUGIN_NAME,
        'Buffers not supported!'));
    }
  });
}

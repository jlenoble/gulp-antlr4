'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  (0, _checkJava2.default)();

  var _formatOptions = (0, _formatOptions3.default)(options),
      parserDir = _formatOptions.parserDir,
      mode = _formatOptions.mode,
      ANTLR4 = _formatOptions.ANTLR4,
      sync = _formatOptions.sync;

  var dataFiles = [];
  var makeParserFiles = (0, _makeParser2.default)(parserDir, mode);
  var mustRequireAfresh = !ANTLR4.isProperlySetup();

  return _through2.default.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new _gulpUtil.PluginError(PLUGIN_NAME, 'Streams are not supported'));
    }

    if (file.isBuffer()) {
      if (_path2.default.extname(file.path).toLowerCase() === '.g4') {
        mustRequireAfresh = true;
        return makeParserFiles(file, callback);
      } else {
        dataFiles.push(file);
        return callback(null);
      }
    }
  }, function (callback) {
    var _this = this;

    var refreshedANTLR4 = ANTLR4;

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
        var muter = (0, _muter3.default)(process.stdout, 'write');

        var consumeFile = (0, _muter2.captured)(muter, function (file) {
          try {
            (0, _consumeData2.default)({
              data: file.contents.toString('utf8'),
              ANTLR4: refreshedANTLR4,
              mode: mode, sync: sync
            });

            file.contents = new Buffer(muter.getLogs()); // eslint-disable-line
            muter.forget();

            _this.push(file);
          } catch (err) {
            callback(new _gulpUtil.PluginError(PLUGIN_NAME, err));
          }
        });

        dataFiles.forEach(consumeFile);

        callback(null);
      } else {
        var _muter = (0, _muter3.default)(process.stdout, 'write');

        var _consumeFile = (0, _muter2.captured)(_muter, function (file) {
          return (0, _consumeData2.default)({
            data: file.contents.toString('utf8'),
            ANTLR4: refreshedANTLR4,
            mode: mode, sync: sync
          }).then(function () {
            file.contents = new Buffer(_muter.getLogs()); // eslint-disable-line
            _muter.forget();

            _this.push(file);
          }, function (err) {
            callback(new _gulpUtil.PluginError(PLUGIN_NAME, err));
          });
        });

        dataFiles.reduce(function (promise, file) {
          return promise.then(function () {
            return _consumeFile(file);
          });
        }, Promise.resolve()).then(function () {
          callback(null);
        }, function (err) {
          callback(new _gulpUtil.PluginError(PLUGIN_NAME, err));
        });
      }
    } else {
      callback(new _gulpUtil.PluginError(PLUGIN_NAME, 'Options are incomplete or inconsistent'));
    }
  });
};

var _gulpUtil = require('gulp-util');

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _muter2 = require('muter');

var _muter3 = _interopRequireDefault(_muter2);

var _checkJava = require('./check-java');

var _checkJava2 = _interopRequireDefault(_checkJava);

var _formatOptions2 = require('./format-options');

var _formatOptions3 = _interopRequireDefault(_formatOptions2);

var _makeParser = require('./make-parser');

var _makeParser2 = _interopRequireDefault(_makeParser);

var _consumeData = require('./consume-data');

var _consumeData2 = _interopRequireDefault(_consumeData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PLUGIN_NAME = 'gulp-antlr4';

module.exports = exports['default'];
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

  return _through2.default.obj(function (file, encoding, done) {
    var _this = this;

    if (file.isNull()) {
      return done(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, 'Streams are not supported'));
      return done();
    }

    if (file.isBuffer()) {
      if (_path2.default.extname(file.path).toLowerCase() === '.g4') {
        mustRequireAfresh = true;
        return makeParserFiles(file).then(function () {
          done(null, file);
        }, function (err) {
          _this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
          done();
        });
      } else {
        dataFiles.push(file);
        return done();
      }
    }
  }, function (done) {
    var _this2 = this;

    var refreshedANTLR4 = ANTLR4;

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

            _this2.push(file);
          } catch (err) {
            _this2.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
            done();
          }
        });

        dataFiles.forEach(consumeFile);

        done(null);
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

            _this2.push(file);
          }, function (err) {
            _this2.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
            done();
          });
        });

        dataFiles.reduce(function (promise, file) {
          return promise.then(function () {
            return _consumeFile(file);
          }, function (err) {
            return done(err);
          });
        }, Promise.resolve()).then(function () {
          done(null);
        }, function (err) {
          _this2.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, err));
          done();
        });
      }
    } else {
      this.emit('error', new _gulpUtil.PluginError(PLUGIN_NAME, refreshedANTLR4.getError() || 'Options are incomplete or inconsistent'));
      done();
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
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeDirectory = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

const removeDirectory = (path, except = []) => {
  if (_fs.default.existsSync(path)) {
    _fs.default.readdirSync(path).forEach(file => {
      // eslint-disable-next-line
      let curPath = path + "/" + file;

      if (_fs.default.lstatSync(curPath).isDirectory() && !except.some(name => (0, _path.basename)(curPath) !== name && (0, _path.dirname)(curPath) !== name)) {
        // recurse
        removeDirectory(curPath);
      } else {
        // delete file
        _fs.default.unlinkSync(curPath);
      }
    });

    _fs.default.rmdirSync(path);
  }
};

exports.removeDirectory = removeDirectory;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetTempFiles = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _preloader = require("./plugins/preloader");

var _fs2 = require("./utils/fs");

const resetTempFiles = async store => {
  store.addTask({
    type: 'batch',
    description: 'Reset applify and git files',
    children: [(0, _preloader.createApplifyDirTask)(store), {
      type: 'task',
      description: `clear ${store.applifyTempFile}`,
      task: () => {
        try {
          _fs.default.writeFileSync(store.applifyTempFile, JSON.stringify({}));

          return {
            printInfo: `Reset ${store.applifyTempFile}`,
            printSuccess: `Reset ${store.applifyTempFile} to {}`
          };
        } catch (err) {
          return {
            printError: err
          };
        }
      }
    }, {
      type: 'task',
      description: `remove ${store.workingDir}/.git`,
      task: async storeCtx => {
        try {
          let found = false;
          await new Promise((resolve, reject) => {
            _fs.default.exists(`${storeCtx.workingDir}/.git`, exists => {
              if (exists) {
                _fs.default.chmodSync(`${storeCtx.workingDir}/.git`, '777');

                found = true;

                try {
                  (0, _fs2.removeDirectory)(`${storeCtx.workingDir}/.git`);
                  resolve();
                } catch (err) {
                  reject(err);
                }
              } else {
                resolve();
              }
            });
          });
          return {
            printInfo: found ? `Removed ${store.workingDir}/.git` : undefined,
            printSuccess: found ? `Removed ${store.workingDir}/.git` : undefined
          };
        } catch (err) {
          return {
            printError: err
          };
        }
      }
    }, {
      type: 'task',
      description: `remove all files from ${store.workingDir}`,
      task: async storeCtx => {
        try {
          (0, _fs2.removeDirectory)(`${storeCtx.workingDir}`, ['.applify', 'temp.json']);
          return {
            printInfo: `Remove all files from ${store.workingDir}`,
            printSuccess: `Removed all files from ${store.workingDir}`
          };
        } catch (err) {
          return {
            printError: err
          };
        }
      }
    }]
  });
  await store.runTasks();
};

exports.resetTempFiles = resetTempFiles;
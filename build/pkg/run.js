"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _commander = _interopRequireDefault(require("commander"));

var _package = _interopRequireDefault(require("./package.json"));

var _print = require("./print");

var _init = _interopRequireDefault(require("./init"));

const run = async argv => {
  const program = _commander.default.version(_package.default.version, '-v, --version').description(_package.default.description);

  program.command('init').alias('i').description('Create a new react project').option('-l, --log', 'Log task output').option('-r, --reset', 'Reset any saved applify variables').option('-c, --config', 'Use a config file').option('-d, --dev', 'Use development mode').action(async cmd => {
    global.log = cmd.log;
    await (0, _print.printHeadingAndArt)();
    await (0, _init.default)({
      devMode: cmd.dev,
      reset: cmd.reset,
      useConfig: cmd.config
    });
  });
  await program.parse(argv);
};

var _default = run;
exports.default = _default;
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _events = _interopRequireDefault(require("events"));

var _path = require("path");

var _events2 = require("./events");

var _print = require("./print");

var _strings = require("./utils/strings");

class Store extends _events.default {
  // eslint-disable-next-line
  constructor() {
    super();
    this.tasksList = [];
    this.questionsList = [];
    this.print = [];
    this.completedSteps = [];
  }

  set(operator, plugin) {
    this[operator] = plugin;
  }

  addTask(task) {
    this.tasksList.push(task);
    this.emit(_events2.ADD_TASK, task);
  }

  addQuestion(question) {
    this.questionsList.push(question);
    this.emit(_events2.ADD_QUESTION, question);
  }

  async runTasks() {
    // Build the tasks
    const tasks = this.tasker.buildTasks(this.tasksList, this); // Run the tasks with this store as the context

    await this.tasker.runTasks(tasks, this); // Clear the tasks

    this.tasksList = [];

    if (this.print.length && global.log) {
      (0, _print.printDebugOutput)(this.print);
      this.print = [];
    }

    this.updateTempStore();
  }

  async runQuestions() {
    const questions = this.prompter.buildQuestions(this.questionsList, this); // Get the answers from the user with store as the context

    await this.prompter.runQuestions(questions, this); // Clear the questions

    this.questionsList = [];
    this.updateTempStore();
  }

  updateTempStore() {
    const applifyDir = (0, _path.join)(process.cwd(), '.applify');
    const applifyTempFile = (0, _path.join)(applifyDir, 'temp.json');

    _fs.default.writeFileSync(applifyTempFile, (0, _strings.stringify)({ ...this,
      preloaded: false
    }));
  }

}

var _default = Store;
exports.default = _default;
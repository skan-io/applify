import fs from 'fs';
import EventEmitter from 'events';
import {join} from 'path';
import {ADD_TASK, ADD_QUESTION} from './events';
import {printDebugOutput} from './print';
import {stringify} from './utils/strings';


class Store extends EventEmitter {
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
    this.emit(ADD_TASK, task);
  }

  addQuestion(question) {
    this.questionsList.push(question);
    this.emit(ADD_QUESTION, question);
  }

  async runTasks() {
    // Build the tasks
    const tasks = this.tasker.buildTasks(this.tasksList, this);
    // Run the tasks with this store as the context
    await this.tasker.runTasks(tasks, this);
    // Clear the tasks
    this.tasksList = [];

    if (this.print.length && global.log) {
      printDebugOutput(this.print);
      this.print = [];
    }

    this.updateTempStore();
  }

  async runQuestions() {
    const questions = this.prompter.buildQuestions(this.questionsList, this);
    // Get the answers from the user with store as the context
    await this.prompter.runQuestions(questions, this);
    // Clear the questions
    this.questionsList = [];

    this.updateTempStore();
  }

  updateTempStore() {
    const applifyDir = join(process.cwd(), '.applify');
    const applifyTempFile = join(applifyDir, 'temp.json');

    fs.writeFileSync(
      applifyTempFile,
      stringify(this)
    );
  }
}

export default Store;

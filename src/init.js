import Store from './store';
import defaultConfig from './default.config';
import {importPlugin} from './plugins/import';
import {STORE_INIT} from './events';


// Initialise all the plugins required by operators and steps
// eslint-disable-next-line
const init = async ()=> {
  const store = new Store();
  const config = defaultConfig();
  const operators = ['tasker', 'prompter'];

  // Initialise the operator plugins
  for (const operator of operators) {
    const operatorPlugin = await importPlugin(store, config[operator]);
    // Assign the operator in the store
    store.set(operator, operatorPlugin);
  }

  // Initialise the manager plugins (manager for each step)
  for (const step of config.steps) {
    const plugin = await importPlugin(store, config[step]);
    await plugin.init(store);
  }

  store.emit(STORE_INIT);

  // Run the initialisation tasks and run the initialisation question
  await store.runTasks();
  await store.runQuestions();

  console.log({store});
};

export default init;

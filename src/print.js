import chalk from 'chalk';

/* eslint no-console: 0 */


export const printInfo = (message, caps=false)=> {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(chalk.blue(printMessage));
  }
  return;
};

export const printSuccess = (message, caps=false)=> {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(chalk.green(printMessage));
  }
  return;
};

export const printError = (message, caps=false)=> {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(chalk.red(printMessage));
  }
  return;
};

export const printWarning = (message, caps=false)=> {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(chalk.yellow(printMessage));
  }
  return;
};

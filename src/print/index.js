import chalk from 'chalk';
import figlet from 'figlet';

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


// Print ascii art and Skan.io heading
export const printHeadingAndArt = async ()=>
  new Promise((resolve, reject)=> {
    figlet.text('APPLIFY!', {
      font: 'ANSI Shadow'
    }, (error, text)=> {
      if (error) {
        console.log(`${error}\n\n`);
        reject();
        return;
      }
      console.log();
      console.log();
      console.log();
      console.log(chalk.magenta(text), '\n');
      resolve();
    });
  });

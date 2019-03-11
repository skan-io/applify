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

export const printDim = (message, colour)=> {
  if (message && message !== '') {
    console.log(chalk.dim(chalk[colour](message)));
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

export const newLine = ()=> console.log('\n');

// eslint-disable-next-line
export const printDebugOutput = (outputs)=> {
  if (outputs.length) {
    console.log(chalk.blue('\n============ DEBUG ============\n'));
  }

  for (const output of outputs) {
    const {
      printInfo: info,
      printWarning: warning,
      printError: error,
      printSuccess: success
    } = output;

    if (info) {
      printInfo(info);
    }
    if (error) {
      printError(error);
    }
    if (success) {
      printSuccess(success);
    }
    if (warning) {
      printWarning(warning);
    }
  }

  if (outputs.length) {
    console.log(chalk.blue('\n===============================\n'));
  }
};

export const printNeedPlugins = ()=> {
  printWarning(`-------------------------------

   PLUGINS MUST BE DEFINED!

-------------------------------`);
};

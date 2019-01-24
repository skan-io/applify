import ora from 'ora';
import {exec, spawn as shellSpawn} from 'child_process';
import {onExit} from '@rauschma/stringio';
import {printInfo, printSuccess, printError} from './print';


export const shellExec = async (cmd)=> new Promise((resolve, reject)=> {
  exec(cmd, (err, stdout, stderr)=> {
    if (err) {
      reject(err);
    } else {
      resolve({stdout, stderr});
    }
  });
});


// eslint-disable-next-line max-statements
export const execute = async (cmd, cmdInfo, throwOnError=false)=> {
  const oraSpinner = ora();

  try {
    if (global.log) {
      printInfo(cmdInfo);
    } else {
      oraSpinner.start(cmdInfo);
    }

    const result = await shellExec(cmd);

    if (global.log) {
      printSuccess(result.stdout);
    } else {
      oraSpinner.succeed();
    }

    printError(result.stderr);
  } catch (err) {
    if (!global.log) {
      oraSpinner.fail();
    }

    printError(err);

    if (throwOnError) {
      throw new Error(err);
    }
  }
};


export const spawn = async (
  cmd, cmdInfo, args, stdio=[process.stdin, process.stdout, process.stderr]
)=> {
  printInfo(cmdInfo);

  const childProcess = shellSpawn(
    cmd,
    args,
    {stdio}
  );

  if (childProcess.stdout) {
    childProcess.stdout.on('data', (data)=> {
      printSuccess(data);
    });
  }

  if (childProcess.stderr) {
    childProcess.stdout.on('data', (data)=> {
      printError(data);
    });
  }

  await onExit(childProcess);
};

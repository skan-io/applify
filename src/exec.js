import {exec} from 'child_process';


export const shellExec = async (cmd)=> new Promise((resolve, reject)=> {
  exec(cmd, (err, stdout, stderr)=> {
    if (err) {
      reject(err);
    } else {
      resolve({stdout, stderr});
    }
  });
});

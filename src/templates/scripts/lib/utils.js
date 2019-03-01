import {relative} from 'path';
import {existsSync, mkdirSync} from 'fs';


export const pkgDir = './build/pkg';


export const pkgRelative = (dir, file)=> (
  relative(dir, file)
    .replace(/\\/g, '/')
);

export const mkdir = (dir)=> {
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
};


export const promised = (fn)=> (...args)=> new Promise(
  (resolve, reject)=> fn(...args, (err, result)=> {
    if (err) {
      reject(err);
    } else {
      resolve(result);
    }
  })
);

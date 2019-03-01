import fs from 'fs';
import {join} from 'path';
import {promised} from './utils';


const readdir = promised(fs.readdir);
const stat = promised(fs.stat);


async function* walk(dir) {
  const files = await readdir(dir);

  for (const fileName of files) {
    if (!fileName.startsWith('.')) {
      const path = join(dir, fileName);
      const stats = await stat(path);

      if (stats && stats.isDirectory()) {
        yield * walk(path);
      } else {
        yield path;
      }
    }
  }
}

export default walk;

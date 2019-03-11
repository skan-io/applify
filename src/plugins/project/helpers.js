import {execute} from '../../execute';


export const getNpmProfileName = async ()=> {
  try {
    const {result} = await execute({
      cmd: 'npm profile get fullname',
      info: 'Get npm profile name'
    });

    return result.stdout.replace(/(\r\n|\n|\r)/gm, '');
  } catch (err) {
    return null;
  }
};

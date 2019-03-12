import {printDim} from '../print';


export const printAnswer = (question, answer)=> {
  printDim(`? ${question}${answer}`, 'white');
};

// eslint-disable-next-line max-statements
export const parseArrayString = (array)=> {
  if (Array.isArray(array)) {
    return parseArrayString(array.toString());
  }

  let string = '';
  if (array !== 'none' && array !== '') {
    const parts = array.split(',');
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      parts[i] = part.trim();
      string += ` ${part.trim()}`;
    }

    return {
      array: parts,
      string
    };
  }

  return {
    array: [],
    string: ''
  };
};

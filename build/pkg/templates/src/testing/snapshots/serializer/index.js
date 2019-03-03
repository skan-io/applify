/* global module */
import {isShallowWrapper} from './utils';
import {shallowSerialize} from './shallow';

export const createSerializer = (options)=> ({
  test: isShallowWrapper,
  print: (wrapper)=> (
    shallowSerialize(wrapper, options)
  )
});

module.exports = createSerializer();

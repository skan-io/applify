import omitBy from 'lodash/omitBy';
import isNil from 'lodash/isNil';
import {Provider} from 'react-redux';
import {propsOfNode} from 'enzyme/build/RSTTraversal';
import {extractTypeName} from './utils';

let serializeWrapper = null;

const leftpad = (text, amount)=> '  '.repeat(amount) + text;

const isPrimitive = (node)=> (
  typeof node === 'string' || typeof node === 'number'
);

const isFunctionalComponent = (node)=> (
  typeof node.type === 'function'
);

const getProps = (node, options)=> {
  const props = omitBy(
    Object.assign({}, propsOfNode(node)),
    (val, key)=> key === 'children' || val === undefined,
  );

  if (!isNil(node.key) && options.noKey !== true) {
    props.key = node.key;
  }

  return props;
};

const serializeNode = (node, inner, depth, options)=> {
  const tagName = extractTypeName(node);
  let header = `${tagName}`;
  const props = getProps(node, options);
  Object.keys(props).forEach((key)=> {
    const prop = props[key];
    let propVal = '';
    if (typeof prop === 'function') {
      propVal = '"function"';
    } else {
      propVal = JSON.stringify(props[key]);
    }
    header += ` ${key}={${propVal}}`;
  });
  if (inner.length) {
    const startTag = leftpad(`<${header}>\n`, depth);
    const endTag = leftpad(`</${tagName}>`, depth);
    return `${startTag}${inner}\n${endTag}`;
  }
  return leftpad(`<${header} />`, depth);
};

const serializeFunctionWrapper = (wrapper, depth, options)=> {
  const node = wrapper.getNodeInternal();

  if (
    (node.type.contextTypes && node.type.contextTypes.store)
    || node.type.name === 'Portal'
  ) {
    // If we are expecting a store this is a non-root connected component.
    // Just serialize the name. It should be tested independently.
    return serializeNode(node, '', depth, options);
  }
  const childWrapper = wrapper.dive();
  if (node.type.name === 'Themed') {
    return serializeWrapper(childWrapper, depth, options);
  }
  const childSerialized = serializeWrapper(childWrapper, depth + 1, options);
  return serializeNode(node, childSerialized, depth, options);
};

const serializeObject = (wrapper, depth, options)=> {
  const node = wrapper.getNodeInternal();
  const numChildren = wrapper.children().length;
  if (numChildren === 0) {
    return serializeNode(node, '', depth);
  }

  const serializeChild =
    (index)=> serializeWrapper(wrapper.childAt(index), depth + 1, options);

  let childrenSerialized = serializeChild(0);
  for (let i = 1; i < numChildren; i += 1) {
    childrenSerialized += `\n${serializeChild(i)}`;
  }
  return serializeNode(node, childrenSerialized, depth, options);
};

serializeWrapper = (wrapper, depth, options)=> {
  const node = wrapper.getNodeInternal();

  if (isPrimitive(node)) {
    return leftpad(node, depth);
  }

  if (isNil(node) || node === false) {
    return '';
  }

  if (isFunctionalComponent(node)) {
    return serializeFunctionWrapper(wrapper, depth, options);
  }

  return serializeObject(wrapper, depth, options);
};

// eslint-disable-next-line max-statements
const serializeRootWrapper = (wrapper, options)=> {
  if (isPrimitive(wrapper)) {
    return wrapper.toString();
  }
  if (isNil(wrapper) || wrapper.length === 0) {
    return '';
  }

  const node = wrapper.getNodeInternal();

  if (isNil(node) || node === false) {
    return '';
  }

  const wrapperInstance = wrapper.instance();
  if (wrapperInstance instanceof Provider) {
    // We only pass the store down to the root component because that
    // is the component we are testing.
    const childWrapper = wrapper.dive({
      context: {store: wrapperInstance.props.store}
    });
    return serializeWrapper(childWrapper, 0, options);
  }
  return serializeWrapper(wrapper, 0, options);
};

export const shallowSerialize =
  (wrapper, options = {})=> serializeRootWrapper(wrapper, options);


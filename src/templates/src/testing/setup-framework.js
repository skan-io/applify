/* eslint-env jest */

/*
This code is run before each test file is run by jest.
It sets up the testing environment with additional matchers as
well as some canvas polyfills to allow openlayers to run.
 */
import {inspect} from 'util';
import {shallow} from 'enzyme';
import diff from 'jest-diff';


// TODO: enable lifecycle methods as it is the default
const shallowOpts = {context: {}, disableLifecycleMethods: true};


export function unwrappedShallow(cmp) {
  if (cmp.type && cmp.type.WrappedComponent) {
    return shallow(cmp, shallowOpts).shallow(shallowOpts);
  }
  return shallow(cmp, shallowOpts);
}


const mockCalled = async (mockFn, check)=> {
  const timeout = 1000;
  const breakTime = timeout + (new Date()).getTime();
  let numCalls = 0;

  while ((new Date()).getTime() < breakTime) {
    const {calls} = mockFn.mock;
    // only check when call count changes
    if (calls.length !== numCalls) {
      numCalls = calls.length;
      if (check()) {
        return;
      }
    }
    await 'yield execution to other async funcs';
  }
};


async function asyncToHaveBeenCalledWith(received, ...expected) {
  const err = new Error();
  Error.captureStackTrace(err, asyncToHaveBeenCalledWith);

  await mockCalled(received, ()=> {
    try {
      expect(received).toHaveBeenCalledWith(...expected);
      return true;
    } catch {
      return false;
    }
  });

  // eslint-disable-next-line no-invalid-this
  const exp = this.isNot ? expect(received).not : expect(received);
  try {
    exp.toHaveBeenCalledWith(...expected);
  } catch (error) {
    err.message = error.message;
    err.matcherResult = error.matcherResult;
    throw err;
  }

  return {pass: true};
}

export const matchers = {
  asyncToHaveBeenCalledWith,
  toDispatch: (store, action)=> ({
    pass: store
      .dispatchSpy
      .mock.calls
      .some(([actual])=> {
        try {
          expect(actual).toEqual(action);
          return true;
        } catch (err) {
          return false;
        }
      }),
    message: ()=> (
      'Expected store to dispatch:\n\n' +
      `${inspect(action, {colors: true, depth: null})}\n\n` +
      `but only found:\n\n${
        store
          .dispatchSpy
          .mock.calls
          .map(([actual])=> inspect(actual, {colors: true, depth: null}))
          .join('\n')
      }`
    )
  }),

  toShallowEqual(actual, expected) {
    const actualWrapped = unwrappedShallow(actual);

    return {
      pass: actualWrapped.equals(expected),
      message: ()=> `${
        this.utils.matcherHint('.toShallowEqual')
      }\n\n${
        diff(actualWrapped.debug(), shallow(expected, shallowOpts).debug())
      }`
    };
  },

  toMatchElem(actual, expected) {
    const actualWrapped = unwrappedShallow(actual);

    return {
      pass: actualWrapped.matchesElement(expected),
      message: ()=> `${
        this.utils.matcherHint('.toMatchElem')
      }\n\n${
        diff(actualWrapped.debug(), shallow(expected, shallowOpts).debug())
      }`
    };
  },

  toContainMatching: (actual, expected)=> {
    const actualWrapped = unwrappedShallow(actual);

    return {
      pass: actualWrapped.containsMatchingElement(expected),
      message: ()=> (
        `Expected:\n${
          actualWrapped.debug()
        }\n\nto contain matching:\n\n${
          shallow(expected, shallowOpts).debug()
        }.`
      )
    };
  },

  toContainAllMatching: (actual, expectedItems)=> {
    const actualWrapped = unwrappedShallow(actual);

    return {
      pass: actualWrapped.containsAllMatchingElements(expectedItems),
      message: ()=> (
        `Expected:\n${
          actualWrapped.debug()
        }\n\nto contain all matching:\n\n${
          expectedItems
            .map((item)=> shallow(item, shallowOpts).debug())
            .join(',\n')
        }.`
      )
    };
  }
};

expect.extend(matchers);

// making sure we handle unhandled rejections in a way that is useful for
// finding the cause

/* globals process */
/* istanbul ignore next */
// eslint-disable-next-line no-process-env
if (!process.env.handlingUnhandledRejection) {
  /* istanbul ignore next */
  process.on('unhandledRejection', (err)=> {
    throw err;
  });
  // eslint-disable-next-line no-process-env
  process.env.handlingUnhandledRejection = true;
}

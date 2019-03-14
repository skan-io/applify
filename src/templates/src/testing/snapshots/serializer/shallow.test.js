/* eslint-disable max-len */
import React from 'react';
import {connect, Provider} from 'react-redux';
import PropTypes from 'prop-types';
import diff from 'jest-diff';
import {shallow} from 'enzyme';
import {shallowSerialize} from './shallow';
import {testStore} from '../../helpers';

const defaultTheme = {
  componentOne: 'mock-componentOne',
  container: 'mock-container'
};

expect.extend({
  toMatchTrimmed: (received, expected)=> {
    const receivedWithoutWhitespace = received.trim();
    const expectedWithoutWhitespace = expected.trim();
    return {
      pass: receivedWithoutWhitespace === expectedWithoutWhitespace,
      message: ()=> diff(expectedWithoutWhitespace, receivedWithoutWhitespace)
    };
  }
});

const TestNullComponent = ()=> null;

const TestComponentWithKeys = ()=> (
  <React.Fragment>
    <div key='child-1'>Child One</div>
    <div key='child-2'>Child Two</div>
    <div key='child-3'>Child Three</div>
  </React.Fragment>
);

describe('shallowSerialize', ()=> {
  describe('for null values', ()=> {
    it('returns empty string for null wrapper', ()=> {
      expect(shallowSerialize(null)).toBe('');
    });

    it('returns empty string for an empty wrapper', ()=> {
      expect(shallowSerialize([])).toBe('');
    });

    it('removes null components', ()=> {
      const testWrapper = shallow(<TestNullComponent />);

      expect(shallowSerialize(testWrapper)).toEqual('');
    });
  });

  describe('for primitive values', ()=> {
    it('renders strings', ()=> {
      expect(shallowSerialize('test')).toBe('test');
    });

    it('renders numbers', ()=> {
      expect(shallowSerialize(42)).toBe('42');
    });
  });

  const TestComponentOne = (
      {numberProp, stringProp, funcProp, children, theme}
  )=> (
    <div className={theme.componentOne}>
      <div onClick={funcProp} className={theme.container}>
        Test Component One
      </div>
      <p />
      {numberProp === undefined ? undefined : <div>{numberProp}</div>}
      {stringProp === undefined ? undefined : <div>{stringProp}</div>}
      {children}
    </div>
  );
  TestComponentOne.propTypes = {
    numberProp: PropTypes.number,
    stringProp: PropTypes.string,
    funcProp: PropTypes.func,
    children: PropTypes.any,
    theme: PropTypes.object
  };

  describe('for single level component', ()=> {
    it('renders component without props', ()=> {
      const testWrapper = shallow(<TestComponentOne theme={defaultTheme} />);

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<div className={"mock-componentOne"}>
  <div className={"mock-container"}>
    Test Component One
  </div>
  <p />
</div>
      `);
    });

    it('renders component with props', ()=> {
      const testWrapper = shallow(
        <TestComponentOne
          theme={defaultTheme}
          numberProp={1}
          stringProp={'foo'}
        />
      );

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<div className={"mock-componentOne"}>
  <div className={"mock-container"}>
    Test Component One
  </div>
  <p />
  <div>
    1
  </div>
  <div>
    foo
  </div>
</div>
      `);
    });

    it('renders function props as {"function"}', ()=> {
      const testFn = jest.fn();
      const testWrapper = shallow(
        <TestComponentOne theme={defaultTheme} funcProp={testFn} />
      );

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<div className={"mock-componentOne"}>
  <div onClick={"function"} className={"mock-container"}>
    Test Component One
  </div>
  <p />
</div>
      `);
    });
  });

  describe('for connected component', ()=> {
    const SimpleComponent = ()=> (
      <div>Testing</div>
    );
    SimpleComponent.propTypes = {
      stringProp: PropTypes.string
    };

    const mapStateToProps = ({user})=> ({
      stringProp: user.sub
    });

    const ConnectedComponent = connect(mapStateToProps)(SimpleComponent);

    it('renders properly', ()=> {
      const store = testStore({
        user: {sub: 'test-string'}
      });
      const testWrapper = shallow(<ConnectedComponent store={store} />);

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<SimpleComponent store={{"nextDispatch":{}}} stringProp={"test-string"} dispatch={"function"} storeSubscription={{"store":{"nextDispatch":{}},"listeners":{}}}>
  <div>
    Testing
  </div>
</SimpleComponent>
      `);
    });

    it('strips the provider', ()=> {
      const store = testStore({
        user: {sub: 'test-string'}
      });
      const testWrapper = shallow(
        <Provider store={store}>
          <ConnectedComponent store={store} />
        </Provider>
      );

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<SimpleComponent store={{"nextDispatch":{}}} stringProp={"test-string"} dispatch={"function"} storeSubscription={{"store":{"nextDispatch":{}},"listeners":{}}}>
  <div>
    Testing
  </div>
</SimpleComponent>
      `);
    });
  });

  describe('for doubly connected component', ()=> {
    const SimpleComponentOne = ()=> (
      <div>Testing</div>
    );
    const ConnectedComponentOne = connect()(SimpleComponentOne);
    const SimpleComponentTwo = ()=> (
      <div>
        <ConnectedComponentOne />
      </div>
    );
    const ConnectedComponentTwo = connect()(SimpleComponentTwo);

    it('renders properly', ()=> {
      const store = testStore();
      const testWrapper = shallow(<ConnectedComponentTwo store={store} />);

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<SimpleComponentTwo store={{"nextDispatch":{}}} dispatch={"function"}>
  <div>
    <Connect(SimpleComponentOne) />
  </div>
</SimpleComponentTwo>
      `);
    });
  });

  describe('for components containing children with keys', ()=> {
    it('renderes keys as props', ()=> {
      const testWrapper = shallow(<TestComponentWithKeys />);

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<Fragment>
  <div key={"child-1"}>
    Child One
  </div>
  <div key={"child-2"}>
    Child Two
  </div>
  <div key={"child-3"}>
    Child Three
  </div>
</Fragment>
      `);
    });

    it('does not render keys if options.noKey is true', ()=> {
      const testWrapper = shallow(<TestComponentWithKeys />);

      expect(shallowSerialize(testWrapper, {noKey: true})).toMatchTrimmed(`
<Fragment>
  <div>
    Child One
  </div>
  <div>
    Child Two
  </div>
  <div>
    Child Three
  </div>
</Fragment>
      `);
    });
  });


  describe('several layers nested component', ()=> {
    it('renders shallowly', ()=> {
      const ChildOne = ()=> <div>Leaf Child</div>;
      const ChildTwo = ()=> <ChildOne />;
      const ChildThree = ()=> <ChildTwo />;
      const Parent = ()=> <ChildThree />;
      const testWrapper = shallow(<Parent />);

      expect(shallowSerialize(testWrapper)).toMatchTrimmed(`
<ChildThree>
  <ChildTwo>
    <ChildOne>
      <div>
        Leaf Child
      </div>
    </ChildOne>
  </ChildTwo>
</ChildThree>
      `);
    });
  });
});

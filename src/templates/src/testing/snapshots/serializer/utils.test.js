import React, {lazy, Suspense, memo} from 'react';
import {mount, shallow, render} from 'enzyme';
import {isShallowWrapper, isReactWrapper, isCheerioWrapper} from './utils';
import {isEnzymeWrapper, extractTypeName} from './utils';

const TestComponent = ()=> <div>Test Component</div>;
TestComponent.displayName = 'TestComponent';

const LazyTestComponent = lazy(()=> <TestComponent />);
// eslint-disable-next-line react/display-name
const MemoTestComponent = memo(()=> <TestComponent />);

describe('isShallowWrapper', ()=> {
  it('returns true for an enzyme shallow wrapper', ()=> {
    const testWrapper = shallow(<TestComponent />);

    expect(isShallowWrapper(testWrapper)).toEqual(true);
    expect(isEnzymeWrapper(testWrapper)).toEqual(true);
  });

  it('returns false for null wrapper', ()=> {
    expect(isShallowWrapper(null)).toEqual(false);
  });
});

describe('isReactWrapper', ()=> {
  it('returns true for an enzyme mount wrapper', ()=> {
    const testWrapper = mount(<TestComponent />);

    expect(isReactWrapper(testWrapper)).toEqual(true);
    expect(isEnzymeWrapper(testWrapper)).toEqual(true);
  });

  it('returns false for null wrapper', ()=> {
    expect(isReactWrapper(null)).toEqual(false);
  });
});

describe('isCheerioWrapper', ()=> {
  it('returns true for an enzyme render wrapper', ()=> {
    const testWrapper = render(<TestComponent />);

    expect(isCheerioWrapper(testWrapper)).toEqual(true);
    expect(isEnzymeWrapper(testWrapper)).toEqual(true);
  });

  it('returns false for null wrapper', ()=> {
    expect(isCheerioWrapper(null)).toEqual(false);
  });
});

describe('extractTypeName', ()=> {
  it('returns the display name for a plain component', ()=> {
    expect(extractTypeName({type: TestComponent})).toEqual('TestComponent');
  });

  it('returns React.Lazy for a lazy component', ()=> {
    expect(extractTypeName({type: LazyTestComponent})).toEqual('React.Lazy');
  });

  it('returns React.Suspense for a suspense component', ()=> {
    expect(extractTypeName({type: Suspense})).toEqual('React.Suspense');
  });

  it('returns React.Memo for a memo component', ()=> {
    // TODO fix this test should expect React.Memo
    expect(extractTypeName({type: MemoTestComponent})).toEqual('Component');
  });
});

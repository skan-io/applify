import React from 'react';
import {shallow, mount, render} from 'enzyme';

const TestComponent = ()=> <div>Test Component</div>;

describe('snapshot serializer', ()=> {
  it('performs custom snapshot matching on shallow rendered', ()=> {
    const testWrapper = shallow(<TestComponent />);

    expect(testWrapper).toMatchSnapshot();
  });

  it('performs default snapshot matching for mounted', ()=> {
    const testWrapper = mount(
      <TestComponent />
    );

    expect(testWrapper).toMatchSnapshot();
  });

  it('performs default snapshot matching for rendered', ()=> {
    const testWrapper = render(
      <TestComponent />
    );

    expect(testWrapper).toMatchSnapshot();
  });
});

/* eslint max-len: 0 */


export const createHelpersFileTask = ({answers})=> `import React from 'react';${answers.useRedux ? `\nimport {createStore, applyMiddleware} from 'redux';\nimport thunk from 'redux-thunk';\nimport reducers from '../reducers';` : ''}
import './theme.scss';
import theme from './theme.scss';

export function withCustomContainer(backgroundColor) {
  const CustomContainer = (story)=> (
    <div className={theme.container} style={{backgroundColor}}>
      {story()}
    </div>
  );
  CustomContainer.displayName = 'CustomContainer';
  return CustomContainer;
}${answers.useRedux ? `\n\nexport const storyStore =\n  (state)=> createStore(reducers, state, applyMiddleware(thunk));` : ''}
`;

export const createHelpersTestFileTask = ({answers})=> `import React from 'react';
import {withCustomContainer${answers.useRedux ? `, storyStore` : ''}} from './helpers';


describe('withCustomBackground', ()=> {
  it('renders story with a custom background', ()=> {
    expect(withCustomContainer('white')(()=> <div>Dummy Story</div>))
      .toMatchElem(
        <div style={{backgroundColor: 'white'}}>
          <div>Dummy Story</div>
        </div>
      );
  });

  it('renders story with a red background', ()=> {
    expect(withCustomContainer('red')(()=> <div>Dummy Story</div>))
      .toMatchElem(
        <div style={{backgroundColor: 'red'}}>
          <div>Dummy Story</div>
        </div>
      );
  });
});${answers.useRedux ? `

describe('storyStore', ()=> {
  it('returns an appropriate redux store', ()=> {
    const store = storyStore();
    expect(store).toHaveProperty('dispatch');
    expect(store).toHaveProperty('getState');
    expect(store).toHaveProperty('subscribe');
  });
});` : ''}
`;

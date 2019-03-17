/* eslint max-len: 0 */


export const createReduxStoreTask = ()=> `import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {responsiveStoreEnhancer} from 'redux-responsive';
import focusEnhancer from 'refocus/enhancer';
import {window} from './globals';
import promiseMiddleware from './middlewares/promise';
import reducers from './reducers';


function getReduxDevTools() {
  const {__REDUX_DEVTOOLS_EXTENSION__} = window;
  let enhancer = (arg)=> arg;

  /* istanbul ignore if */
  if (typeof __REDUX_DEVTOOLS_EXTENSION__ === 'function') {
    enhancer = __REDUX_DEVTOOLS_EXTENSION__();
  }
  return enhancer;
}


const initialState = {};

export const store = createStore(
  reducers,
  initialState,
  compose(
    responsiveStoreEnhancer,
    focusEnhancer,
    applyMiddleware(
      thunkMiddleware,
      promiseMiddleware
    ),
    getReduxDevTools()
  )
);
`;

export const createReducersTask = ()=> `import {combineReducers} from 'redux';
import {createResponsiveStateReducer} from 'redux-responsive';
import focus from 'refocus/reducer';


const browser = createResponsiveStateReducer(
  {extraSmall: 480, small: 767, medium: 992, large: 1450}
);

export default combineReducers({
  focus,
  browser
  // ... add more reducers
});
`;

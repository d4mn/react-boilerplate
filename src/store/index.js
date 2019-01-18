import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { Map } from 'immutable';

import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import immutableStateMerger from 'redux-storage-merger-immutablejs';

import rootReducer from '../reducers';
import loggerConfig from '../config/logger';
import { __DEBUG__ } from '../config/constants';

export const history = createBrowserHistory();

const initialStoreState = Map();
const enhancers = [];
const middlewares = [
  thunkMiddleware,
  routerMiddleware(history),
];

if (__DEBUG__) {
  const { devToolsExtension } = window;

  if (typeof devToolsExtension === 'function') {
    console.info('[setup] ✓ Enabling Redux DevTools Extension');
    enhancers.push(devToolsExtension());
  }

  console.info('[setup] ✓ Enabling state logger');
  const loggerMiddleware = createLogger({
    level: 'info',
    collapsed: true,
    stateTransformer: (state) => state.toJS(),
    predicate: (getState, action) => {
      const state = getState();

      const showBlacklisted = state.getIn(['debug', 'logs', 'blacklisted']);
      if (loggerConfig.blacklist.indexOf(action.type) !== -1 && !showBlacklisted) {
        return false;
      }

      return state.getIn(['debug', 'logs', 'enabled']);
    },
  });
  middlewares.push(loggerMiddleware);
}

// Setup local storage
const storageReducer = storage.reducer(rootReducer(history), immutableStateMerger);
const storageEngine = createEngine(process.env.APP_NAME, (key, value) => {
  // Provide your keys here that have to be excluded of saving in local storage.
  const excluded_keys = ['routing', 'ui'];
  if (excluded_keys.indexOf(key) === -1) return value;
});
const storageMiddleware = storage.createMiddleware(storageEngine);
middlewares.push(storageMiddleware);

const composedEnhancers = compose(
  applyMiddleware(...middlewares),
  ...enhancers
);

const store = createStore(
  storageReducer,
  initialStoreState,
  composedEnhancers
);

// Use the provided storage loader to load the local storage in to the store.
const storageLoader = storage.createLoader(storageEngine);
storageLoader(store);

export default store;

import { createStore, applyMiddleware, compose  } from 'redux';
import thunkMiddleware from 'redux-thunk';

import trackerApp from './reducers';

export default function configureStore ( preloadedState ) {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    return createStore( trackerApp, preloadedState, composeEnhancers(
        applyMiddleware(
            thunkMiddleware
        )
    ) );
}

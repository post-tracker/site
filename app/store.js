import { createStore, applyMiddleware  } from 'redux';
import thunkMiddleware from 'redux-thunk';

import trackerApp from './reducers';

export default function configureStore ( preloadedState ) {
    return createStore(
        trackerApp,
        preloadedState,
        applyMiddleware(
            thunkMiddleware
        )
    );
}

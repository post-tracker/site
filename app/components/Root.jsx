import React from 'react';
import { Provider } from 'react-redux';

import configureStore from '../store';
import App from './App.jsx';

const store = configureStore();

window.reduxStore = store;

class Root extends React.Component {
    constructor () {
        super();

        this.state = {
            key: Date.now(),
        };
    }

    componentDidMount(){
        window.addEventListener( 'gamechange', () => {
            this.setState( {
                key: Date.now(),
            } );
        } );
    }

    render () {
        console.log( 'got Root re-render' );
        return (
            <Provider
                store = { store }
            >
                <App
                    key = { this.state.key }
                />
            </Provider>
        );
    }
}

export default Root;

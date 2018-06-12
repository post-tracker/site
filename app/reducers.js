import { combineReducers } from 'redux';
import queryString from 'querystring';
import cookie from 'react-cookie';

import {
    RECEIVE_POSTS,
    REQUEST_POSTS,
    SET_SEARCH_TERM,
    TOGGLE_GROUP,
    TOGGLE_SERVICE,
} from './actions';

const groups = function groups ( state = {
    items: window.trackerData.groups,
}, action ) {
    let updatedItems;
    const currentQuery = queryString.parse( location.search.substr( 1 ) );

    if ( typeof currentQuery[ 'groups[]' ] === 'string' ) {
        currentQuery[ 'groups[]' ] = [ currentQuery[ 'groups[]' ] ];
    }

    switch ( action.type ) {
        case TOGGLE_GROUP:
            if ( action.name === 'All' ) {
                updatedItems = state.items.map( ( group ) => {
                    group.active = false;

                    return group;
                } );
            } else {
                updatedItems = state.items.map( ( group ) => {
                    if ( group.name === action.name ) {
                        group.active = !group.active;
                    }

                    return group;
                } );
            }

            return Object.assign( {}, state, {
                items: updatedItems,
            } );
        default:
            if ( typeof currentQuery[ 'groups[]' ] !== 'undefined' ) {
                updatedItems = state.items.map( ( group ) => {
                    if ( currentQuery[ 'groups[]' ].indexOf( group.name ) > -1 ) {
                        group.active = true;
                    } else {
                        group.active = false;
                    }

                    return group;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            const active = state.items.filter( ( item ) => {
                return item.active;
            } );

            if ( active.length === state.items.length ) {
                state.items = state.items.map( ( item ) => {
                    item.active = false;

                    return item;
                } );
            }

            return state;
    }
};

const services = function services ( state = {
    items: window.trackerData.services,
}, action ) {
    let updatedItems;
    const currentQuery = queryString.parse( location.search.substr( 1 ) );

    if ( typeof currentQuery[ 'services[]' ] === 'string' ) {
        currentQuery[ 'services[]' ] = [ currentQuery[ 'services[]' ] ];
    }

    switch ( action.type ) {
        case TOGGLE_SERVICE:
            updatedItems = state.items.map( ( service ) => {
                if ( service.name === action.name ) {
                    service.active = !service.active;
                }

                return service;
            } );

            // Save an array of active services
            cookie.save( 'services',
                updatedItems
                    .map( ( service ) => {
                        if ( service.active ) {
                            return service.name;
                        }

                        return false;
                    } )
                    .filter( ( service ) => {
                        return service;
                    } )
                , {
                    path: '/',
                }
            );

            return Object.assign( {}, state, {
                items: updatedItems,
            } );
        default:
            // Check if we have a query of services
            if ( typeof currentQuery[ 'service[]' ] !== 'undefined' ) {
                updatedItems = state.items.map( ( service ) => {
                    if ( currentQuery[ 'service[]' ].indexOf( service.name ) > -1 ) {
                        service.active = true;
                    } else {
                        service.active = false;
                    }

                    return service;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            // Check if we have a cookie set for services
            if ( cookie.load( 'services' ) ) {
                const activeServices = cookie.load( 'services' );

                updatedItems = state.items.map( ( service ) => {
                    if ( activeServices.indexOf( service.name ) > -1 ) {
                        service.active = true;
                    } else {
                        service.active = false;
                    }

                    return service;
                } );

                return Object.assign( {}, state, {
                    items: updatedItems,
                } );
            }

            return state;
    }
};

const search = function search ( state, action ) {
    const currentQuery = queryString.parse( location.search.substr( 1 ) );

    switch ( action.type ) {
        case SET_SEARCH_TERM:
            return action.term;
        default:
            if ( typeof currentQuery.search !== 'undefined' ) {
                return currentQuery.search;
            }

            return '';
    }
};

const posts = function posts ( state = {
    items: [],
    isFetching: true,
}, action ) {
    switch ( action.type ) {
        case REQUEST_POSTS:
            return Object.assign( {}, state, {
                isFetching: true,
            } );
        case RECEIVE_POSTS:
            return Object.assign( {}, state, {
                items: action.posts,
                lastUpdated: action.receivedAt,
                isFetching: false,
            } );
        default:
            return state;
    }
};

const trackerApp = combineReducers( {
    groups,
    posts,
    search,
    services,
} );

export default trackerApp;
